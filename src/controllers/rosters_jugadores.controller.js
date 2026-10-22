const { RosterJugador, Jugador } = require('../models');

const listarJugadores = async (req, res) => {
    try {
        const jugadores = await RosterJugador.findAll({
            where: { id_roster: req.params.id },
            include: [{ model: Jugador }]
        });
        res.status(200).json({
            success: true,
            jugadores
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const asignarJugador = async (req, res) => {
    try {
        const asignacion = await RosterJugador.create({
            id_roster: req.params.id,
            id_jugador: req.body.id_jugador,
            rol_en_roster: req.body.rol_en_roster || 'Suplente'
        });
        res.status(201).json({
            success: true,
            asignacion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const cambiarRol = async (req, res) => {
    try {
        const [actualizado] = await RosterJugador.update(
            { rol_en_roster: req.body.rol_en_roster },
            {
                where: {
                    id_roster: req.params.id,
                    id_jugador: req.params.id_jugador
                }
            }
        );
        if (!actualizado) {
            return res.status(404).json({
                success: false
            });
        }
        const asignacion = await RosterJugador.findOne({
            where: {
                id_roster: req.params.id,
                id_jugador: req.params.id_jugador
            }
        });
        res.status(200).json({
            success: true,
            asignacion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const quitarJugador = async (req, res) => {
    try {
        const eliminado = await RosterJugador.destroy({
            where: {
                id_roster: req.params.id,
                id_jugador: req.params.id_jugador
            }
        });
        if (!eliminado) {
            return res.status(404).json({
                success: false
            });
        }
        res.status(204).json({
            success: true,
            eliminado
        }).send();
    } catch (error) {
        res.status(500).json({
            success: false,
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