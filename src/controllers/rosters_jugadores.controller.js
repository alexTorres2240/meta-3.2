const rostersJugadoresModel = require('../models/rosters_jugadores.model.js');


// GET /rosters/{id}/jugadores - Listar jugadores un roster
const listarJugadores = (req, res) => {
    try {
        const id_roster = parseInt(req.params.id);
        const jugadores = rostersJugadoresModel.listarJugadores(id_roster);

        if (!jugadores) {
            return res.status(404).json({
                message: 'Lista no encontrada'
            });
        }

        res.json(jugadores);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al listar los jugadores',
            error: error.message
        });
    }
};

// POST /rosters/{id}/jugadores - Asignar jugador a roster
const asignarJugador = (req, res) => {
    try {
        const datos = {
            id_roster: parseInt(req.params.id),
            id_jugador: parseInt(req.body.id_jugador),
            rol_jugador: req.body.rol_jugador
        };

        const nuevaAsignacion = rostersJugadoresModel.asignarJugador(datos);

        if (!nuevaAsignacion) {
            return res.status(404).json({
                message: "Roster/Jugador no encontrado"
            });
        }

        res.status(201).json(nuevaAsignacion);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al asignar jugador',
            error: error.message
        });
    }
};


// PUT  /rosters/{id}/jugadores/{id_jugador} - Cambiar rol en roster (Titular/Suplente)
const cambiarRol = (req, res) => {
    try {
        const datos = {
            id_roster: parseInt(req.params.id),
            id_jugador: parseInt(req.params.id_jugador),
            rol_jugador: req.body.rol_jugador
        };
        const asignacionActualizada = rostersJugadoresModel.cambiarRol(datos);

        if (!asignacionActualizada) {
            return res.status(404).json({
                message: 'Roster/Jugador no encontrado'
            });
        }

        res.json(asignacionActualizada);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar rol de jugador',
            error: error.message
        });
    }
};

// DELETE /rosters/{id}/jugadores/{id_jugador} - Quitar jugador del roster
const quitarJugador = (req, res) => {
    try {
        const id_roster = parseInt(req.params.id);
        const id_jugador = parseInt(req.params.id_jugador);
        const asignacionEliminada = rostersJugadoresModel.quitarJugador(id_roster, id_jugador);

        if (!asignacionEliminada) {
            return res.status(404).json({
                message: 'Roster/Jugador no encontrado'
            });
        }

        res.json({
            message: 'Jugador eliminado',
            asignacion: asignacionEliminada
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al quitar jugador',
            error: error.message
        });
    }
};

module.exports = {
    listarJugadores,
    asignarJugador,
    cambiarRol,
    quitarJugador
};