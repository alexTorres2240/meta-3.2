const { Op, EagerLoadingError } = require('sequelize');
const { Roster, RosterJugador, Jugador } = require('../models');

const MAX_TITULARES = 5;
const ROLES_EN_ROSTER = ['Titular', 'Suplente'];

const errorCon = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};

const listarPorRoster = async (id_roster) => {
    const roster = await Roster.findByPk(id_roster);
    if (!roster) throw errorCon('Roster no encontrado', 404);
    return RosterJugador.findAll({
        where: { id_roster },
        include: [{ model: Jugador }]
    });
};

const asignar = async ({ id_roster, id_jugador, rol_en_roster }) => {
    const roster = await Roster.findByPk(id_roster);
    if (!roster) throw errorCon('Jugador no encontrado', 404);
    const jugador = await Jugador.findByPk(id_jugador);
    if (!jugador) throw errorCon('Jugador no encontrado', 404);
    if (jugador.estado !== 'activo') throw errorCon('El jugador no esta activo', 409);
    const nuevoRol = rol_en_roster || 'Suplente';
    if (!ROLES_EN_ROSTER.includes(nuevoRol)) {
        throw errorCon('rol_en_roster debe ser Titular o Suplente', 400);
    }
    const yaAsignado = await RosterJugador.findOne({ where: { id_roster, id_jugador } });
    if (yaAsignado) {
        throw errorCon('El jugador ya esta en este roster', 409);
    }
    if (nuevoRol === 'Titular') {
        await validarTitular(id_roster, jugador.rol);
    }
    return RosterJugador.create({
        id_roster,
        id_jugador,
        rol_en_roster: nuevoRol
    });
};

const cambiarRol = async ({ id_roster, id_jugador, rol_en_roster }) => {
    if (!ROLES_EN_ROSTER.includes(rol_en_roster)) {
        throw errorCon('rol_en_roster debe ser Titular o Suplente', 400);
    }
    const roster = await Roster.findByPk(id_roster);
    if (!roster) throw errorCon('Roster no encontrado', 404);
    const asignacion = await RosterJugador.findOne({ where: { id_roster, id_jugador } });
    if (!asignacion) throw errorCon('Asignacion no encontrada', 404);
    if (rol_en_roster === 'Titular' && asignacion.rol_en_roster !== 'Titular') {
        const jugador = await Jugador.findByPk(id_jugador);
        await validarTitular(id_roster, jugador.rol, id_jugador);
    }
    await asignacion.update({ rol_en_roster });
    return asignacion;
};

const quitar = async ({ id_roster, id_jugador }) => {
    const roster = await Roster.findByPk(id_roster);
    if (!roster) throw errorCon('Roster no encontrado', 404);
    const eliminado = await RosterJugador.destroy({ where: { id_roster, id_jugador } });
    if (!eliminado) throw errorCon('Asignacion no encontrada', 404);
};

const validarTitular = async (id_roster, rolJugador, idJugadorExcluir = null) => {
    const titulares = await RosterJugador.count({
        where: { id_roster, rol_en_roster: 'Titular' }
    });
    if (titulares >= MAX_TITULARES) {
        throw errorCon('El roster ya tiene el maximo de 5 titulares', 409);
    }
    const where = { id_roster, rol_en_roster: 'Titular' };
    if (idJugadorExcluir) where.id_jugador = { [Op.ne]: idJugadorExcluir };
    const rolOcupado = await RosterJugador.findOne({
        where,
        include: [{ model: Jugador, where: { rol: rolJugador } }]
    });
    if (rolOcupado) {
        throw errorCon(`Ya hay un titular con el rol ${rolJugador} en este roster`, 409);
    }
};

module.exports = {
    listarPorRoster,
    asignar,
    cambiarRol,
    quitar
};