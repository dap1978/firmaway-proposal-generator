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
  const { transcript, language = 'es', commercial_name } = req.body;

  if (!transcript || transcript.trim().length < 50) {
    return res.status(400).json({ error: 'La transcripción es demasiado corta.' });
  }

  try {
    const aiData = await generateProposal(transcript, language);
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

// ── GET /api/proposals ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, proposal_number, commercial_name, language,
              lead_name, lead_detail, package, price,
              was_edited, urgency_score, created_at
       FROM proposals
       ORDER BY created_at DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/proposals/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM proposals WHERE id = $1',
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

    const prices = { starter: 499, pro: 645, all_in: 1199 };
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

module.exports = router;
