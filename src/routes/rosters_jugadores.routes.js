const express = require('express');
const router = express.Router();
const rostersJugadoresController = require('../controllers/rosters_jugadores.controller.js');


// GET /rosters/{id}/jugadores - Listar jugadores un roster
router.get('/rosters/:id/jugadores', rostersJugadoresController.listarJugadores);

// POST /rosters/{id}/jugadores - Asignar jugador a roster
router.post('/rosters/:id/jugadores', rostersJugadoresController.asignarJugador);

// PUT  /rosters/{id}/jugadores/{id_jugador} - Cambiar rol en roster (Titular/Suplente)
router.put('/rosters/:id/jugadores/:id_jugador', rostersJugadoresController.cambiarRol);

// DELETE /rosters/{id}/jugadores/{id_jugador} - Quitar jugador del roster
router.delete('/rosters/:id/jugadores/:id_jugador', rostersJugadoresController.quitarJugador);


module.exports = router;