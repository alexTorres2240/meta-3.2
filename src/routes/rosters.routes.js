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

module.exports = router;