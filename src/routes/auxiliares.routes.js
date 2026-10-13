const router = require('express').Router();
const { ROLES, ESTADOS, TIPOS_ROSTER } = require('../utils/constants');

router.get('/roles', (req, res) => res.json(ROLES));
router.get('/estados', (req, res) => req.json(ESTADOS));
router.get('/tipos-roster', (req, res) => res.json(TIPOS_ROSTER));
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

module.exports = router;