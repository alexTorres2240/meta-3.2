/**
 * Modelo de Jugador
 * Base de datos en memoria (lista de jugadores)
 */

let jugadores = [
    { id: 1, nickname: 'Dexter', nombre_real: 'Michael Williams', pais: 'Estados Unidos', rol: 'Jungle', estado: 'activo' },
    { id: 2, nickname: 'Zatanaz', nombre_real: 'Valentin Lopez', pais: 'Mexico', rol: 'Mid', estado: 'activo' },
    { id: 3, nickname: 'Mecha', nombre_real: 'Haruto Tanaka', pais: 'Japon', rol: 'Top', estado: 'activo' },
    { id: 4, nickname: 'Lion', nombre_real: 'Wei Zhang', pais: 'China', rol: 'ADC', estado: 'activo' },
    { id: 5, nickname: 'Beatle', nombre_real: 'Oliver Smith', pais: 'Inglaterra', rol: 'Support', estado: 'activo' }
];

let idActual = 6;

// Listar todos los jugadores
const obtenerTodos = () => jugadores;

// Obtener detalle de un jugador
const obtenerPorId = (id) => jugadores.find(j => j.id === id);

// Crear un jugador
const crearJugador = (datos) => {
    const nuevo = {
        id: idActual++,
        nickname: datos.nickname,
        nombre_real: datos.nombre_real,
        pais: datos.pais,
        rol: datos.rol,
        estado: datos.estado
    };
    jugadores.push(nuevo);
    return nuevo;
};

// Actualizar un jugador
const actualizarJugador = (id, datos) => {
    const indice = jugadores.findIndex(j => j.id === id);
    if (indice === -1) return null;
    jugadores[indice] = {
        id: id,
        nickname: datos.nickname,
        nombre_real: datos.nombre_real,
        pais: datos.pais,
        rol: datos.rol,
        estado: datos.estado
    };
    return jugadores[indice];
};

// Eliminar un jugador
const eliminarJugador = (id) => {
    const indice = jugadores.findIndex(j => j.id === id);
    if (indice === -1) return null;
    return jugadores.splice(indice, 1)[0];
};

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crearJugador,
    actualizarJugador,
    eliminarJugador
};