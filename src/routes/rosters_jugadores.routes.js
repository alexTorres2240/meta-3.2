const express = require('express');
const router = express.Router();
const rostersJugadoresController = require('../controllers/rosters_jugadores.controller.js');

router.get('/rosters/:id/jugadores', rostersJugadoresController.listarJugadores);
router.post('/rosters/:id/jugadores', rostersJugadoresController.asignarJugador);
router.put('/rosters/:id/jugadores/:id_jugador', rostersJugadoresController.cambiarRol);
router.delete('/rosters/:id/jugadores/:id_jugador', rostersJugadoresController.quitarJugador);

module.exports = router;