const express = require('express');
const router = express.Router();
const db = require('../config/database');

function serialize(row) {
  return {
    obligUsd: Number(row.oblig_usd),
    wyoming: Number(row.wyoming),
    nuevoMexico: Number(row.nuevo_mexico),
    delaware: Number(row.delaware),
    florida: Number(row.florida),
    texas: Number(row.texas),
    pkgSolo: Number(row.pkg_solo),
    pkgStarter: Number(row.pkg_starter),
    pkgPro: Number(row.pkg_pro),
    pkgAllin: Number(row.pkg_allin),
    exchangeRate: Number(row.exchange_rate),
    updatedAt: row.updated_at,
  };
}

// ── GET /api/pricing ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM pitch_pricing WHERE id = 1');
    if (!rows.length) return res.status(404).json({ error: 'Precios no configurados.' });
    res.json(serialize(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/pricing ──────────────────────────────────────────────────────
router.patch('/', async (req, res) => {
  const {
    obligUsd, wyoming, nuevoMexico, delaware, florida, texas,
    pkgSolo, pkgStarter, pkgPro, pkgAllin, exchangeRate,
  } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE pitch_pricing SET
        oblig_usd = $1, wyoming = $2, nuevo_mexico = $3, delaware = $4, florida = $5, texas = $6,
        pkg_solo = $7, pkg_starter = $8, pkg_pro = $9, pkg_allin = $10, exchange_rate = $11,
        updated_at = NOW()
       WHERE id = 1
       RETURNING *`,
      [obligUsd, wyoming, nuevoMexico, delaware, florida, texas, pkgSolo, pkgStarter, pkgPro, pkgAllin, exchangeRate]
    );
    if (!rows.length) return res.status(404).json({ error: 'Precios no configurados.' });
    res.json(serialize(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
