const express = require('express');
const router = express.Router();
const jugadoresController = require('../controllers/jugadores.controller.js');


// GET /jugadores - Listar todos los jugadores
router.get('/jugadores', jugadoresController.obtenerTodos);

// GET /jugadores/{id} - Obtener detalle de un jugador
router.get('/jugadores/:id', jugadoresController.obtenerPorId);

// POST /jugadores - Crear un jugador
router.post('/jugadores', jugadoresController.crearJugador);

// PUT /jugadores/{id} - Actualizar un jugador
router.put('/jugadores/:id', jugadoresController.actualizarJugador);

// DELETE /jugadores/{id} - Eliminar un jugador
router.delete('/jugadores/:id', jugadoresController.eliminarJugador);


module.exports = router;