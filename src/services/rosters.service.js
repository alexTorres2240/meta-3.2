const { Roster } = require('../models');

const listar = async({ tipo, temporada, juego } = {}) => {
    const where = {};
    if (tipo) where.tipo = tipo;
    if (temporada) where.temporada = temporada;
    if (juego) where.juego = juego;
    return Roster.findAll({ where });
};

const obtenerPorId = async(id) => {
    const roster = await Roster.findByPk(id, {
        include: [{ association: 'jugadores' }]
    });
    if (!roster) {
        const error = new Error('Roster no encontrado');
        error.status = 404;
        throw error;
    }
    return roster;
};

const crear = async (datos) => {
    return Roster.create({
        nombre: datos.nombre,
        juego: datos.juego || 'League Of Legends',
        tipo: datos.tipo,
        temporada: datos.temporada
    });
};

const actualizar = async (id, datos) => {
    const roster = await obtenerPorId(id);
    return roster.update(datos);
};

const eliminar = async (id) => {
    const roster = await obtenerPorId(id);
    await roster.destroy();
};

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};