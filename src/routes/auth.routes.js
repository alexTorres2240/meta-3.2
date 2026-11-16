
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { login, me, logout } from '../controllers/auth.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

import {
    verificarCsrf,
    verificarOrigen
} from '../middlewares/csrf.js';

const router = Router();

// Limitar intentos de inicio de sesión
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Demasiados intentos. Intenta más tarde.'
    }
});

router.post('/auth/login', verificarOrigen, loginLimiter, login);

// Consultar usuario autenticado
router.get('/auth/me', autenticar, me);

router.post(
    '/auth/logout',
    autenticar,
    verificarCsrf,
    logout
);

// Ruta de prueba exclusiva para Admin
router.get('/auth/admin', autenticar, soloAdmin, (req, res) => {
    res.json({
        success: true,
        message: 'Acceso de administrador autorizado'
    });
});

export default router;
