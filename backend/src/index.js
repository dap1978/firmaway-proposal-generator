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
