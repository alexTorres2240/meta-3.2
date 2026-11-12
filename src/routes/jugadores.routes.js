import express from 'express';
import jugadoresController from '../controllers/jugadores.controller.js';

const router = express.Router();

router.get('/jugadores', jugadoresController.obtenerTodos);
router.get('/jugadores/:id', jugadoresController.obtenerPorId);
router.post('/jugadores', jugadoresController.crearJugador);
router.put('/jugadores/:id', jugadoresController.actualizarJugador);
router.delete('/jugadores/:id', jugadoresController.eliminarJugador);

export default router;