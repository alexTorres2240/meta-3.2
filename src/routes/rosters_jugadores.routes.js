import express from 'express';
import rostersJugadoresController from '../controllers/rosters_jugadores.controller.js';

const router = express.Router();

router.get('/rosters/:id/jugadores', rostersJugadoresController.listarJugadores);
router.post('/rosters/:id/jugadores', rostersJugadoresController.asignarJugador);
router.put('/rosters/:id/jugadores/:id_jugador', rostersJugadoresController.cambiarRol);
router.delete('/rosters/:id/jugadores/:id_jugador', rostersJugadoresController.quitarJugador);

export default router;