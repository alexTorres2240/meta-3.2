const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API de Rosters y Jugadores' }));

app.use('/api', require('./routes/auxiliares.routes'));
app.use('/api', require('./routes/jugadores.routes'));
app.use('/api', require('./routes/rosters.routes'));
app.use('/api', require('./routes/rosters_jugadores.routes'));

app.use((req, res) => res.status(404).json({message: 'Ruta no encontrada' }));
app.use(require('./middlewares/errorHandler'));

module.exports = app;