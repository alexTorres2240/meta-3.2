const { Op } = require('sequelize');
const { Jugador } = require('../models');

const CAMPOS_REQUERIDOS = ['nickname', 'nombre_real', 'pais', 'rol', 'estado'];
const ROLES_VALIDOS = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
const ESTADOS_VALIDOS = ['activo', 'inactivo'];

const validarJugador = (datos) => {
    const faltantes = CAMPOS_REQUERIDOS.filter(c => !datos[c]);
    if (faltantes.length) {
        throw errorCon (`Campos requeridos: ${faltabtes.join(', ')}`, 400);
    }
    if (!ROLES_VALIDOS.includes(datos.rol)) {
        throw errorCon(`Rol invalido. Permitidos: ${ROVLES_VALIDOS.join(', ')}`, 400);
    }
    if (!ESTADOS_VALIDOS.includes(datos.estado)) {
        throw errorCon(`Estado invalido. Permitidos: ${ESTADOS_VALIDOS.join(', ')}`, 400);
    }
}

const listar = async({ rol, estado, search } = {}) => {
    const where = {};
    if (rol) where.rol = rol;
    if (estado) where. estado = estado;
    if (search) {
        where[Op.or] = [
            { nickname: { [Op.like]: `%${search}` } },
            { nombre_real: { [Op.like]: `%${search}` } },
            { pais: { [Op.like]: `%${search}` } }
        ];
    }
    return Jugador.findAll({ where });
};

const obtenerPorId = async (id) => {
    const jugador = await Jugador.findByPk(id);
    if (!jugador) {
        const error = new Error('Jugador no encontrado');
        error.status = 404;
        throw error;
    }
    return jugador;
};

const crear = async (datos) => {
    validarJugador(datos);
    return Jugador.create({
        nickname: datos.nickname,
        nombre_real: datos.nombre_real,
        pais: datos.pais,
        rol: datos.rol,
        estado: datos.estado
    });
};

const actualizar = async (id, datos) => {
    validarJugador(datos);
    const jugador = await obtenerPorId(id);
    return jugador.update(datos);
};

const eliminar = async (id) => {
    const jugador = await obtenerPorId(id);
    await jugador.destroy();
}

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};