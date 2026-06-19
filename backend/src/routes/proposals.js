const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { generateProposal } = require('../services/claude');
const { renderTemplate } = require('../services/template');
const { generatePDF } = require('../services/pdf');

// ── Generar número de propuesta ────────────────────────────────────────────
async function nextProposalNumber() {
  const result = await db.query("SELECT nextval('proposal_seq') AS val");
  const seq = parseInt(result.rows[0].val, 10);
  const year = new Date().getFullYear();
  return `FW-${year}-${String(seq).padStart(4, '0')}`;
}

// ── POST /api/proposals/generate ──────────────────────────────────────────
router.post('/generate', async (req, res) => {
  const { transcript, language = 'es', notes, commercial_name, commercial_nickname: senderNickname } = req.body;

  if (!transcript || transcript.trim().length < 50) {
    return res.status(400).json({ error: 'La transcripción es demasiado corta.' });
  }

  try {
    const aiData = await generateProposal(transcript, language, notes);

    // Usar el nickname del usuario logueado (tiene precedencia sobre el detectado por Claude)
    const nickname = senderNickname || aiData.commercial_nickname || 'Seba';
    aiData.commercial_nickname = nickname;

    // Firmar el mensaje de WhatsApp con el nombre real del que envía
    if (aiData.whatsapp_draft && !aiData.whatsapp_draft.includes(nickname)) {
      aiData.whatsapp_draft = aiData.whatsapp_draft.trimEnd() + `\n— ${nickname}`;
    }

    const proposalNumber = await nextProposalNumber();

    const { rows } = await db.query(
      `INSERT INTO proposals
        (proposal_number, commercial_name, language, lead_name, lead_detail,
         package, price, urgency_score, transcript, generated_data, final_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)
       RETURNING *`,
      [
        proposalNumber,
        commercial_name || aiData.commercial_name || 'Sebastián Bedoya',
        language,
        aiData.lead_name,
        aiData.lead_detail,
        aiData.package,
        aiData.price,
        aiData.urgency_score,
        transcript,
        JSON.stringify(aiData),
      ]
    );

    // Guardar objeciones
    if (aiData.objections && aiData.objections.length > 0) {
      for (const obj of aiData.objections) {
        await db.query(
          `INSERT INTO objections (proposal_id, objection_text, suggested_response)
           VALUES ($1, $2, $3)`,
          [rows[0].id, obj.objection, obj.response]
        );
      }
    }

    res.json({ id: rows[0].id, proposal_number: proposalNumber, data: aiData });
  } catch (err) {
    console.error('Error generando propuesta:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/proposals/stats ── ANTES de /:id ─────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.commercial_name,
        COUNT(DISTINCT p.id)::int                                          AS total,
        COUNT(DISTINCT CASE WHEN p.status = 'sent' THEN p.id END)::int    AS sent,
        COUNT(DISTINCT pv.proposal_id)::int                               AS leads_opened,
        COUNT(pv.id)::int                                                  AS total_views
      FROM proposals p
      LEFT JOIN proposal_views pv ON pv.proposal_id = p.id
      GROUP BY p.commercial_name
      ORDER BY sent DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/proposals ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.id, p.proposal_number, p.commercial_name, p.language,
        p.lead_name, p.lead_detail, p.package, p.price,
        p.was_edited, p.urgency_score, p.status, p.sent_at,
        p.public_token, p.created_at,
        COUNT(pv.id)::int        AS view_count,
        MAX(pv.viewed_at)        AS last_viewed_at
      FROM proposals p
      LEFT JOIN proposal_views pv ON pv.proposal_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/proposals/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.*,
        COUNT(pv.id)::int AS view_count,
        MAX(pv.viewed_at) AS last_viewed_at
       FROM proposals p
       LEFT JOIN proposal_views pv ON pv.proposal_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });

    const { rows: objRows } = await db.query(
      'SELECT * FROM objections WHERE proposal_id = $1 ORDER BY created_at',
      [req.params.id]
    );

    res.json({ ...rows[0], objections: objRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/proposals/:id/preview (HTML para iframe) ────────────────────
router.get('/:id/preview', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM proposals WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send('No encontrada');

    const html = renderTemplate(rows[0]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

// ── PATCH /api/proposals/:id ──────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  const { final_data, package: pkg } = req.body;

  try {
    const { rows: current } = await db.query(
      'SELECT * FROM proposals WHERE id = $1',
      [req.params.id]
    );
    if (!current.length) return res.status(404).json({ error: 'No encontrada' });

    const prices = { solo_llc: 495, starter: 499, pro: 645, all_in: 1199 };
    const newPkg = pkg || current[0].package;
    const newPrice = prices[newPkg] || current[0].price;

    const mergedFinalData = {
      ...(current[0].final_data || current[0].generated_data || {}),
      ...(final_data || {}),
    };

    const { rows } = await db.query(
      `UPDATE proposals
       SET final_data = $1, package = $2, price = $3, was_edited = true
       WHERE id = $4
       RETURNING *`,
      [JSON.stringify(mergedFinalData), newPkg, newPrice, req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/proposals/:id/send ─────────────────────────────────────────
router.post('/:id/send', async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE proposals SET status = 'sent', sent_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/proposals/:id/pdf ───────────────────────────────────────────
router.post('/:id/pdf', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM proposals WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });

    const html = renderTemplate(rows[0]);
    const pdfBuffer = await generatePDF(html);

    const fileName = `propuesta-${rows[0].proposal_number}-${(rows[0].lead_name || 'lead').replace(/\s+/g, '-').toLowerCase()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generando PDF:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/proposals/p/:token — vista pública (loguea apertura) ─────────
// NOTA: debe ir después de los otros GET específicos pero antes de /:id
// Se registra en /api/proposals/p/:token
router.get('/p/:token', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, proposal_number, lead_name, commercial_name, created_at, expires_at FROM proposals WHERE public_token = $1',
      [req.params.token]
    );
    if (!rows.length) return res.status(404).json({ error: 'Propuesta no encontrada' });

    const proposal   = rows[0];
    const expiresAt  = proposal.expires_at
      ? new Date(proposal.expires_at)
      : new Date(new Date(proposal.created_at).getTime() + 15 * 24 * 60 * 60 * 1000);
    const isExpired  = new Date() > expiresAt;

    // Loguear apertura (incluso si está vencida, para tracking)
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || '';
    await db.query(
      'INSERT INTO proposal_views (proposal_id, ip, user_agent) VALUES ($1, $2, $3)',
      [proposal.id, ip, req.headers['user-agent'] || '']
    );

    res.json({ ...proposal, expires_at: expiresAt.toISOString(), is_expired: isExpired });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
