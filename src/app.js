const express = require('express');
const app = express();

app.use(express.json());
app.use(require('./routes/auxiliares.routes'));
app.use(require('./routes/jugadores.routes'));
app.use(require('./routes/rosters.routes'));
app.use(require('./routes/rosters_jugadores.routes'));
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

module.exports = app;