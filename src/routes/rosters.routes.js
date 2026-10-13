const express = require('express');
const router = express.Router();
const rostersController = require('../controllers/rosters.controller.js');


// GET /rosters - Listar todos los rosters
router.get('/rosters', rostersController.obtenerTodos);

// GET /rosters/{id} - Obtener detalle de un roster (con jugadores)
router.get('/rosters/:id', rostersController.obtenerPorId);

// POST /rosters - Crear un roster
router.post('/rosters', rostersController.crearRoster);

// PUT /rosters/{id} - Actualizar un roster
router.put('/rosters/:id', rostersController.actualizarRoster);

// DELETE /rosters/{id} - Eliminar un roster
router.delete('/rosters/:id', rostersController.eliminarRoster);


// GET /rosters/{id}/jugadores - Listar jugadores un roster
router.get('/rosters/:id/jugadores', rostersController.listarJugadores);

// POST /rosters/{id}/jugadores - Asignar jugador a roster
router.post('/rosters/:id/jugadores', rostersController.asignarJugador);

// PUT  /rosters/{id}/jugadores/{id_jugador} - Cambiar rol en roster (Titular/Suplente)
router.put('/rosters/:id/jugadores/:id_jugador', rostersController.cambiarRol);

// DELETE /rosters/{id}/jugadores/{id_jugador} - Quitar jugador del roster
router.delete('/rosters/:id/jugadores/:id_jugador', rostersController.quitarJugador);


module.exports = router;