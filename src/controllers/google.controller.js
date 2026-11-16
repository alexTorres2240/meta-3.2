
import googleAuth from 'google-auth-library';
import jwt from 'jsonwebtoken';

import {
    randomBytes,
    randomUUID,
    timingSafeEqual
} from 'node:crypto';

import modelos from '../models/index.js';
import { emitirCsrfCookie } from '../middlewares/csrf.js';

const { OAuth2Client } = googleAuth;
const { Usuario } = modelos;

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    JWT_SECRET,
    FRONTEND_ORIGIN
} = process.env;

if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GOOGLE_CALLBACK_URL ||
    !JWT_SECRET ||
    !FRONTEND_ORIGIN
) {
    throw new Error('Falta configuración de Google OAuth');
}

const clienteGoogle = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
);

// Cookies temporales para OAuth
const opcionesTemporales = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth/google'
};

// Comparar tokens de manera segura
function compararSeguro(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }

    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    return bufferA.length === bufferB.length &&
        timingSafeEqual(bufferA, bufferB);
}

// ========================================
// GET /auth/google/login
// ========================================
export async function googleLogin(req, res, next) {
    try {
        // Identificador aleatorio de la solicitud
        const state = randomBytes(32).toString('hex');

        // Crear desafío PKCE
        const { codeVerifier, codeChallenge } =
            await clienteGoogle.generateCodeVerifierAsync();

        // Guardar datos temporales
        res.cookie('google_oauth_state', state, {
            ...opcionesTemporales,
            maxAge: 5 * 60 * 1000
        });

        res.cookie('google_oauth_pkce', codeVerifier, {
            ...opcionesTemporales,
            maxAge: 5 * 60 * 1000
        });

        // Construir URL de Google
        const url = clienteGoogle.generateAuthUrl({
            response_type: 'code',
            access_type: 'online',
            scope: ['openid', 'email', 'profile'],
            state,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge
        });

        return res.redirect(url);

    } catch (error) {
        next(error);
    }
}

// ========================================
// GET /auth/google/callback
// ========================================
export async function googleCallback(req, res, next) {
    const { code, state } = req.query;

    const stateGuardado =
        req.cookies?.google_oauth_state;

    const codeVerifier =
        req.cookies?.google_oauth_pkce;

    // Eliminar cookies temporales
    res.clearCookie('google_oauth_state', opcionesTemporales);
    res.clearCookie('google_oauth_pkce', opcionesTemporales);

    if (req.query.error) {
        return res.status(400).send(
            'Autenticación cancelada o rechazada por Google.'
        );
    }

    if (
        typeof code !== 'string' ||
        typeof codeVerifier !== 'string' ||
        !compararSeguro(state, stateGuardado)
    ) {
        return res.status(403).send(
            'Solicitud de Google OAuth inválida o expirada.'
        );
    }

    try {
        // Intercambiar código de autorización por tokens
        const { tokens } = await clienteGoogle.getToken({
            code,
            codeVerifier
        });

        if (!tokens.id_token) {
            return res.status(401).send(
                'No se recibió un token de identidad.'
            );
        }

        // Verificar identidad con Google
        const ticket = await clienteGoogle.verifyIdToken({
            idToken: tokens.id_token,
            audience: GOOGLE_CLIENT_ID
        });

        const perfil = ticket.getPayload();

        if (
            !perfil?.sub ||
            !perfil?.email ||
            perfil.email_verified !== true
        ) {
            return res.status(401).send(
                'No se pudo verificar la cuenta de Google.'
            );
        }

        const correo = perfil.email.trim().toLowerCase();

        // Buscar cuenta vinculada a Google
        let usuario = await Usuario.findOne({
            where: {
                google_sub: perfil.sub
            }
        });

        if (!usuario) {
            // Evitar vincular cuentas locales automáticamente
            const existente = await Usuario.findOne({
                where: { correo }
            });

            if (existente) {
                return res.status(409).send(
                    'Este correo ya está registrado. ' +
                    'Utiliza tu método de acceso habitual.'
                );
            }

            // Registrar nuevo usuario en MySQL
            usuario = await Usuario.create({
                nombre: perfil.name || correo.split('@')[0],
                correo,
                google_sub: perfil.sub,
                password_hash: null,
                rol: 'usuario',
                activo: true
            });
        }

        if (!usuario.activo) {
            return res.status(403).send(
                'Esta cuenta está desactivada.'
            );
        }

        // Crear sesión JWT de nuestra aplicación
        const jti = randomUUID();

        const token = jwt.sign(
            {},
            JWT_SECRET,
            {
                algorithm: 'HS256',
                subject: String(usuario.id),
                issuer: 'rosters-api',
                audience: 'rosters-frontend',
                jwtid: jti,
                expiresIn: '1h'
            }
        );

        // Cookie de autenticación
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 1000
        });

        // Cookie de protección CSRF
        emitirCsrfCookie(res, jti);

        // Regresar al frontend Vue
        return res.redirect(FRONTEND_ORIGIN);

    } catch (error) {
        next(error);
    }
}
