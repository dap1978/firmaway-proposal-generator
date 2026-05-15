const express = require('express');
const router = express.Router();

const USERS = [
  { id: 'sebastian', name: 'Sebastián Bedoya', nickname: 'Seba', language: 'es' },
  { id: 'paola',     name: 'Paola Marcano',    nickname: 'Paola', language: 'es' },
  { id: 'daniel',    name: 'Daniel',            nickname: 'Daniel', language: 'es' },
  { id: 'tatiana',   name: 'Tatiana',           nickname: 'Tatiana', language: 'pt' },
  { id: 'ivana',     name: 'Ivana',             nickname: 'Ivana', language: 'es' },
];

router.get('/', (req, res) => {
  res.json(USERS);
});

module.exports = router;
