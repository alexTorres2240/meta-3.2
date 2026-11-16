
import { emitirCsrfCookie } from '../middlewares/csrf.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

import modelos from '../models/index.js';

const { Usuario } = modelos;

if (!process.env.JWT_SECRET ||
    Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 bytes');
}

const COOKIE_NAME = 'auth_token';

export const login = async (req, res) => {
    const correo = String(req.body?.correo ?? '')
        .trim()
        .toLowerCase();

    const password = req.body?.password;

    if (!correo || typeof password !== 'string' || !password) {
        return res.status(400).json({
            success: false,
            error: 'Correo y contraseña requeridos'
        });
    }

    const usuario = await Usuario.findOne({
        where: { correo }
    });

    const valido = usuario &&
        usuario.activo &&
        await bcrypt.compare(password, usuario.password_hash);

    if (!valido) {
        return res.status(401).json({
            success: false,
            error: 'Credenciales incorrectas'
        });
    }

    const jti = randomUUID();

    const token = jwt.sign(
        {},
        process.env.JWT_SECRET,
        {
            algorithm: 'HS256',
            subject: String(usuario.id),
            issuer: 'rosters-api',
            audience: 'rosters-frontend',
            jwtid: jti,
            expiresIn: '1h'
        }
    );

    // Guardar JWT en una cookie HttpOnly
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 1000
    });

    emitirCsrfCookie(res, jti);

    res.status(200).json({
        success: true,
        message: 'Sesión iniciada correctamente',
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        }
    });
};

export const me = (req, res) => {
    res.status(200).json({
        success: true,
        usuario: req.usuario
    });
};


export const logout = (req, res) => {
    const opciones = {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    };

    res.clearCookie('auth_token', {
        ...opciones,
        httpOnly: true
    });

    res.clearCookie('csrf_token', {
        ...opciones,
        httpOnly: false
    });

    return res.status(204).send();
};

