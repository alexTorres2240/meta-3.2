const express = require('express');
const router = express.Router();
const jugadoresController = require('../controllers/jugadores.controller.js');

router.get('/jugadores', jugadoresController.obtenerTodos);
router.get('/jugadores/:id', jugadoresController.obtenerPorId);
router.post('/jugadores', jugadoresController.crearJugador);
router.put('/jugadores/:id', jugadoresController.actualizarJugador);
router.delete('/jugadores/:id', jugadoresController.eliminarJugador);

module.exports = router;