import express from 'express';
import rostersController from '../controllers/rosters.controller.js';

const router = express.Router();

router.get('/rosters', rostersController.obtenerTodos);
router.get('/rosters/:id', rostersController.obtenerPorId);
router.post('/rosters', rostersController.crearRoster);
router.put('/rosters/:id', rostersController.actualizarRoster);
router.delete('/rosters/:id', rostersController.eliminarRoster);

export default router;