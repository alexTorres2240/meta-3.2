
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

import auxiliaresRoutes from './routes/auxiliares.routes.js';
import jugadoresRoutes from './routes/jugadores.routes.js';
import rostersRoutes from './routes/rosters.routes.js';
import rostersJugadoresRoutes from './routes/rosters_jugadores.routes.js';

import errorHandler from './middlewares/errorHandler.js';

import { autenticar, soloAdmin } from './middlewares/auth.js';
import { verificarCsrf } from './middlewares/csrf.js';

const app = express();

const swaggerDocument = YAML.load(
    fileURLToPath(new URL('./docs/openapi.yaml', import.meta.url))
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({ message: 'API de Rosters y Jugadores' });
});


app.use('/api', auxiliaresRoutes);

// Autenticación y cierre de sesión
app.use('/auth/google', googleRoutes);
app.use('/api', authRoutes);

function autorizarDatos(req, res, next) {
    if (req.path === '/jugadores/disponibles') {
        return soloAdmin(req, res, next);
    }
    if (req.method === 'GET' || req.method === 'HEAD') {
        return next();
    }
    return soloAdmin(req, res, next);
}

app.use(
    '/api',
    autenticar,
    autorizarDatos,
    verificarCsrf,
    jugadoresRoutes
);

app.use(
    '/api',
    autenticar,
    autorizarDatos,
    verificarCsrf,
    rostersRoutes
);

app.use(
    '/api',
    autenticar,
    autorizarDatos,
    verificarCsrf,
    rostersJugadoresRoutes
);


app.use((req, res) => {
    res.status(404).json({
        message: 'Ruta no encontrada'
    });
});

app.use(errorHandler);

export default app;
