const express = require('express');
const router = express.Router();
const rostersController = require('../controllers/rosters.controller.js');

router.get('/rosters', rostersController.obtenerTodos);
router.get('/rosters/:id', rostersController.obtenerPorId);
router.post('/rosters', rostersController.crearRoster);
router.put('/rosters/:id', rostersController.actualizarRoster);
router.delete('/rosters/:id', rostersController.eliminarRoster);

module.exports = router;