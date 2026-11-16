
import {
    createHmac,
    randomBytes,
    timingSafeEqual
} from 'node:crypto';

const CSRF_COOKIE = 'csrf_token';

const opcionesCookie = {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
};

if (
    !process.env.CSRF_SECRET ||
    Buffer.byteLength(process.env.CSRF_SECRET, 'utf8') < 32
) {
    throw new Error('CSRF_SECRET debe tener al menos 32 bytes');
}

// Crear una firma ligada al identificador de sesión JWT
function firmar(jti, nonce) {
    const mensaje =
        `${jti.length}:${jti}:${nonce.length}:${nonce}`;

    return createHmac('sha256', process.env.CSRF_SECRET)
        .update(mensaje)
        .digest('hex');
}

// Generar cookie CSRF después del login
export function emitirCsrfCookie(res, jti) {
    const nonce = randomBytes(32).toString('hex');
    const firma = firmar(jti, nonce);

    res.cookie(CSRF_COOKIE, `${nonce}.${firma}`, {
        ...opcionesCookie,
        httpOnly: false,
        maxAge: 60 * 60 * 1000
    });
}

// Verificar token CSRF en operaciones de escritura
export function verificarCsrf(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const cookie = req.cookies?.[CSRF_COOKIE];
    const encabezado = req.get('X-CSRF-Token');
    const jti = req.authJti;

    const formato = /^[a-f0-9]{64}\.[a-f0-9]{64}$/;

    if (
        typeof jti === 'string' &&
        typeof cookie === 'string' &&
        typeof encabezado === 'string' &&
        formato.test(cookie) &&
        formato.test(encabezado)
    ) {
        const coinciden = timingSafeEqual(
            Buffer.from(cookie),
            Buffer.from(encabezado)
        );

        if (coinciden) {
            const [nonce, firmaRecibida] = encabezado.split('.');
            const firmaEsperada = firmar(jti, nonce);

            const firmaValida = timingSafeEqual(
                Buffer.from(firmaRecibida, 'hex'),
                Buffer.from(firmaEsperada, 'hex')
            );

            if (firmaValida) {
                return next();
            }
        }
    }

    return res.status(403).json({
        success: false,
        error: 'Token CSRF ausente o inválido'
    });
}

// Evitar solicitudes de login desde sitios no autorizados
export function verificarOrigen(req, res, next) {
    const origenPermitido =
        process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

    if (req.get('Origin') !== origenPermitido) {
        return res.status(403).json({
            success: false,
            error: 'Origen de solicitud no permitido'
        });
    }

    next();
}
