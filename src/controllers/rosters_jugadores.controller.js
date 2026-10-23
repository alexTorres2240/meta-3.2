const { Op } = require('sequelize');
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
        const id_roster = req.params.id;
        const id_jugador = req.body.id_jugador;
        const nuevoRol = req.body.rol_en_roster || 'Suplente';
        const jugador = await Jugador.findByPk(id_jugador);
        if (!jugador) {
            return res.status(404).json({
                success: false
            });
        }
        const yaAsignado = await RosterJugador.findOne({ where: { id_roster, id_jugador } });
        if (yaAsignado) {
            return res.status(404).json({
                success: false,
                error: 'El jugador ya esta en el roster'
            });
        }
        if (nuevoRol === 'Titular') {
            const titulares = await RosterJugador.count({
                where: { id_roster, rol_en_roster: 'Titular' }
            });
            if (titulares >= 5) {
                return res.status(409).json({
                    success: false,
                    error: 'El roster supera el maximo de titulares'
                });
            }
            const rolOcupado = await RosterJugador.findOne({
                where: { id_roster, rol_en_roster: 'Titular' },
                include: [{ model: Jugador, where: { rol: jugador.rol } }]
            });
            if (rolOcupado) {
                return res.status(409).json({
                    success: false,
                    error: 'El roster ya tiene un titular en ese rol'
                });
            }
        }
        const asignacion = await RosterJugador.create({
            id_roster,
            id_jugador,
            rol_en_roster: nuevoRol
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
        const { id, id_jugador } = req.params;
        const nuevoRol = req.body.rol_en_roster;
        if (!['Titular', 'Suplente'].includes(nuevoRol)) {
            return res.status(409).json({
                success: false,
                error: 'El rol en roster debe ser Titular o Suplente'
            });
        }
        const asignacionActual = await RosterJugador.findOne({
            where: { id_roster: id, id_jugador }
        });
        if (!asignacionActual) {
            return res.status(404).json({
                success: false
            });
        }
        if (nuevoRol === 'Titular' && asignacionActual.rol_en_roster !== 'Titular') {
            const titulares = await RosterJugador.count({
                where: { id_roster: id, rol_en_roster: 'Titular' }
            });
            if (titulares >= 5) {
                return res.status(409).json({
                    success: false,
                    error: 'El roster supera el limite de Titulares'
                });
            }
            const jugador = await Jugador.findByPk(id_jugador);
            const rolOcupado = await RosterJugador.findOne({
                where: { id_roster: id, rol_en_roster: 'Titular', id_jugador: { [Op.ne]: id_jugador } },
                include: [{ model: Jugador, where: { rol: jugador.rol } }]
            });
            if (rolOcupado) {
                return res.status(409).json({
                    success: false,
                    error: 'Ya hay un titular con ese rol'
                });
            }
        }
        await (asignacionActual.update({ rol_en_roster: nuevoRol }));
        res.status(200).json({
            success: false,
            asignacionActual
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