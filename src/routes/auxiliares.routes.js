
import express from 'express';

import {
    ROLES,
    ESTADOS,
    TIPOS_ROSTER,
    ROLES_ROSTER
} from '../utils/constants.js';

const router = express.Router();

router.get('/roles', (req, res) => res.json(ROLES));
router.get('/estados', (req, res) => res.json(ESTADOS));
router.get('/tipos-roster', (req, res) => res.json(TIPOS_ROSTER));

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

router.get('/roles-roster', (req, res) => res.json(ROLES_ROSTER));

export default router;
