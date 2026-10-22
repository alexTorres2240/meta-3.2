/**
 * Lógica de negocio de la relación Roster <-> Jugador
 *
 * Validaciones al asignar un jugador:
 *  - El roster y el jugador deben existir
 *  - El jugador debe estar 'activo'
 *  - Un jugador NO puede estar en dos rosters (ni duplicado en el mismo)
 *  - El rol_jugador debe ser 'Titular' o 'Suplente'
 *  - Un roster no puede tener más de MAX_TITULARES titulares
 */
const { Roster, Jugador, RosterJugador } = require('../models');
const { AppError, requerir, limpiar, parsearId } = require('../utils/errors');
const { ROLES_ROSTER } = require('../utils/constants');

const MAX_TITULARES = 5;

const validarRolJugador = (rol) => {
    if (!ROLES_ROSTER.includes(rol)) {
        throw new AppError(400, `El rol_jugador debe ser uno de: ${ROLES_ROSTER.join(', ')}`);
    }
};

const validarCupoTitulares = async (id_roster) => {
    const titulares = await RosterJugador.count({ where: { id_roster, rol_jugador: 'Titular' } });
    if (titulares >= MAX_TITULARES) {
        throw new AppError(409, `El roster ya tiene el máximo de ${MAX_TITULARES} titulares`);
    }
};

const buscarRosterOFallar = async (id_roster) => {
    const roster = await Roster.findByPk(id_roster);
    if (!roster) throw new AppError(404, 'Roster no encontrado');
    return roster;
};

const buscarAsignacionOFallar = async (id_roster, id_jugador) => {
    const asignacion = await RosterJugador.findOne({ where: { id_roster, id_jugador } });
    if (!asignacion) throw new AppError(404, 'El jugador no pertenece a este roster');
    return asignacion;
};

const listarJugadores = async (id_roster) => {
    await buscarRosterOFallar(id_roster);
    return RosterJugador.findAll({ where: { id_roster }, order: [['id', 'ASC']] });
};

const asignarJugador = async ({ id_roster, id_jugador, rol_jugador }) => {
    const rol = limpiar(rol_jugador);
    requerir({ id_jugador, rol_jugador: rol }, ['id_jugador', 'rol_jugador']);
    const idJugador = parsearId(id_jugador, 'id_jugador');
    validarRolJugador(rol);

    const roster = await buscarRosterOFallar(id_roster);

    const jugador = await Jugador.findByPk(idJugador);
    if (!jugador) throw new AppError(404, 'Jugador no encontrado');

    if (jugador.estado !== 'activo') {
        throw new AppError(409, `El jugador '${jugador.nickname}' está ${jugador.estado} y no puede asignarse a un roster`);
    }

    // Regla principal: un jugador solo puede estar en un roster
    const existente = await RosterJugador.findOne({ where: { id_jugador: idJugador } });
    if (existente) {
        if (existente.id_roster === id_roster) {
            throw new AppError(409, `El jugador '${jugador.nickname}' ya pertenece a este roster`);
        }
        const otro = await Roster.findByPk(existente.id_roster);
        throw new AppError(
            409,
            `El jugador '${jugador.nickname}' ya está registrado en el roster '${otro.nombre}' (id ${otro.id}). Quítalo de ese roster antes de asignarlo a otro`
        );
    }

    if (rol === 'Titular') await validarCupoTitulares(roster.id);

    return RosterJugador.create({ id_roster, id_jugador: idJugador, rol_jugador: rol });
};

const cambiarRol = async ({ id_roster, id_jugador, rol_jugador }) => {
    const rol = limpiar(rol_jugador);
    requerir({ rol_jugador: rol }, ['rol_jugador']);
    validarRolJugador(rol);

    await buscarRosterOFallar(id_roster);
    const asignacion = await buscarAsignacionOFallar(id_roster, id_jugador);

    // Solo hay que revisar el cupo si pasa de Suplente a Titular
    if (rol === 'Titular' && asignacion.rol_jugador !== 'Titular') {
        await validarCupoTitulares(id_roster);
    }

    return asignacion.update({ rol_jugador: rol });
};

const quitarJugador = async (id_roster, id_jugador) => {
    await buscarRosterOFallar(id_roster);
    const asignacion = await buscarAsignacionOFallar(id_roster, id_jugador);
    await asignacion.destroy();
    return asignacion;
};

module.exports = {
    MAX_TITULARES,
    listarJugadores,
    asignarJugador,
    cambiarRol,
    quitarJugador
};
