
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'node:url';

import auxiliaresRoutes from './routes/auxiliares.routes.js';
import jugadoresRoutes from './routes/jugadores.routes.js';
import rostersRoutes from './routes/rosters.routes.js';
import rostersJugadoresRoutes from './routes/rosters_jugadores.routes.js';

import errorHandler from './middlewares/errorHandler.js';

const app = express();

const swaggerDocument = YAML.load(
    fileURLToPath(new URL('./docs/openapi.yaml', import.meta.url))
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API de Rosters y Jugadores' });
});

app.use('/api', auxiliaresRoutes);
app.use('/api', jugadoresRoutes);
app.use('/api', rostersRoutes);
app.use('/api', rostersJugadoresRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: 'Ruta no encontrada'
    });
});

app.use(errorHandler);

export default app;
