
import jwt from 'jsonwebtoken';
import modelos from '../models/index.js';
import { emitirCsrfCookie } from '../middlewares/csrf.js';

const { Usuario } = modelos;

export const autenticar = async (req, res, next) => {
    const token = req.cookies?.auth_token;

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Debes iniciar sesión'
        });
    }

    let payload;

    try {
        payload = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            issuer: 'rosters-api',
            audience: 'rosters-frontend'
        });
        if (typeof payload.jti !== 'string' || !payload.jti) {
            return res.status(401).json({
                success: false,
                error: 'Identificador de sesión inválido'
            });
        }

        req.authJti = payload.jti;
    } catch {
        return res.status(401).json({
            success: false,
            error: 'Sesión inválida o expirada'
        });
    }

    try {
        const usuario = await Usuario.findByPk(payload.sub);

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autorizado'
            });
        }

        req.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        };

        next();
    } catch (error) {
        next(error);
    }
};

export const soloAdmin = (req, res, next) => {
    if (req.usuario?.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Acceso exclusivo para administradores'
        });
    }

    next();
};
