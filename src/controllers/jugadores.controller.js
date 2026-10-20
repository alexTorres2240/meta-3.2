const jugadoresModel = require('../models/jugadores.model.js');

// GET /jugadores - Listar todos los jugadores
const obtenerTodos = (req, res) => {
    try {
        const jugadores = jugadoresModel.obtenerTodos();

        if (!jugadores) {
            return res.status(404).json({
                success: false,
                message: 'Jugadores no encontrados'
            });
        }

        res.status(200).json({
            success: true,
            jugadores
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error: error.message
        });
    }
};

// GET /jugadores/{id} - Obtener detalle de un jugador
const obtenerPorId = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const jugador = jugadoresModel.obtenerPorId(id);

        if (!jugador) {
            return res.status(404).json({
                success: false,
                message: 'Jugador no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            jugador
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error: error.message
        });
    }
};

// POST /jugadores - Crear un jugador
const crearJugador = (req, res) => {
    try {
        const datos = {
            nickname: req.body.nickname,
            nombre_real: req.body.nombre_real,
            pais: req.body.pais,
            rol: req.body.rol,
            estado: req.body.estado
        };
        
        const nuevoJugador = jugadoresModel.crearJugador(datos);

        res.status(201).json({
            success: true,
            nuevoJugador
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno',
            error: error.message
        });
    }
};

// PUT /jugadores/{id} - Actualizar un jugador
const actualizarJugador = (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const datos = {
            nickname: req.body.nickname,
            nombre_real: req.body.nombre_real,
            pais: req.body.pais,
            rol: req.body.rol,
            estado: req.body.estado
        };

        const jugadorActualizado = jugadoresModel.actualizarJugador(id, datos);

        if (!jugadorActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Jugador no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            jugadorActualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar al jugador',
            error: error.message
        });
    }
};

// DELETE /jugadores/{id} - Eliminar un jugador
const eliminarJugador = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const jugadorEliminado = jugadoresModel.eliminarJugador(id);

        if (!jugadorEliminado) {
            return res.status(404).json({
                message: 'Jugador no encontrado'
            });
        }

        res.status(204).json({
            success: true,
            jugador: jugadorEliminado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar al jugador',
            error: error.message
        });
    }
};

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crearJugador,
    actualizarJugador,
    eliminarJugador
};