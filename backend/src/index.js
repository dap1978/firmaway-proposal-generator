require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Rutas ──────────────────────────────────────────────────────────────────
app.use('/api/users', require('./routes/users'));
app.use('/api/proposals', require('./routes/proposals'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// ── Migraciones ────────────────────────────────────────────────────────────
async function runMigrations() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proposal_number   VARCHAR(20) UNIQUE NOT NULL,
        commercial_name   VARCHAR(100) NOT NULL,
        language          VARCHAR(5) DEFAULT 'es',
        lead_name         VARCHAR(200),
        lead_detail       VARCHAR(500),
        package           VARCHAR(20),
        price             INTEGER,
        was_edited        BOOLEAN DEFAULT false,
        urgency_score     VARCHAR(10),
        transcript        TEXT,
        generated_data    JSONB,
        final_data        JSONB,
        created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS objections (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proposal_id       UUID REFERENCES proposals(id) ON DELETE CASCADE,
        objection_text    TEXT,
        suggested_response TEXT,
        created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE SEQUENCE IF NOT EXISTS proposal_seq START 1
    `);

    await db.query(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft'`);
    await db.query(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE`);
    await db.query(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid()`);
    await db.query(`UPDATE proposals SET public_token = gen_random_uuid() WHERE public_token IS NULL`);
    await db.query(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE`);
    await db.query(`UPDATE proposals SET expires_at = created_at + INTERVAL '15 days' WHERE expires_at IS NULL`);

    // Propuestas whitelabel (para socios que revenden bajo su marca)
    await db.query(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS proposal_type VARCHAR(20) NOT NULL DEFAULT 'llc'`);
    await db.query(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS case_price INTEGER`);

    await db.query(`
      CREATE TABLE IF NOT EXISTS proposal_views (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proposal_id  UUID REFERENCES proposals(id) ON DELETE CASCADE,
        viewed_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ip           VARCHAR(100),
        user_agent   TEXT
      )
    `);

    console.log('✅ Migraciones completadas');
  } catch (err) {
    console.error('❌ Error en migraciones:', err.message);
  }
}

// ── Arranque ───────────────────────────────────────────────────────────────
async function start() {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  });
}

start();
