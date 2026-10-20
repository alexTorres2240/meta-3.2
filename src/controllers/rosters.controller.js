const rostersModel = require('../models/rosters.model.js');

// GET /rosters - Listar todos los rosters
const obtenerTodos = (req, res) => {
    try {
        const rosters = rostersModel.obtenerTodos();

        res.status(200).json({
            success: true,
            rosters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error: error.message
        });
    }
};

// GET /rosters/{id} - Obtener detalle de un roster (con jugadores)
const obtenerPorId = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const roster = rostersModel.obtenerPorId(id);

        if (!roster) {
            return res.status(404).json({
                success: false,
                mensaje: 'Roster no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            roster
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error: error.message
        });
    }
};

// POST /rosters - Crear un roster
const crearRoster = (req, res) => {
    try {
        const datos = {
            nombre: req.body.nombre,
            juego: req.body.juego,
            tipo: req.body.tipo,
            temporada: req.body.temporada
        };

        const nuevoRoster = rostersModel.crearRoster(datos);
        res.status(201).json({
            success: true,
            nuevoRoster
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error: error.message
        });
    }
};

// PUT /rosters/{id} - Actualizar un roster
const actualizarRoster = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const datos = {
            nombre: req.body.nombre,
            juego: req.body.juego,
            tipo: req.body.tipo,
            temporada: req.body.temporada
        };

        const rosterActualizado = rostersModel.actualizarRoster(id, datos);

        if (!rosterActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Roster no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            rosterActualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error: error.message
        });
    }
};

// DELETE /rosters/{id} - Eliminar un roster
const eliminarRoster = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const rosterEliminado = rostersModel.eliminarRoster(id);

        if (!rosterEliminado) {
            return res.status(404).json({
                message: 'Roster no encontrado'
            });
        }

        res.status(204).json({
            success: true,
            rosterEliminado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error: error.message
        });
    }
};

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crearRoster,
    actualizarRoster,
    eliminarRoster
};