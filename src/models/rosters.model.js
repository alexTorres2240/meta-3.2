/**
 * Modelo de Roster
 * Base de datos en memoria (lista de rosters)
 */

let rosters = [
    { id: 1, nombre: 'Warriors', juego: 'League Of Legends', tipo: 'Principal', temporada: '2026' }
];

let idActual = 2;

// Listar todos los rosters
const obtenerTodos = (req, res) => {
    return rosters;
};

// Obtener detalle de un roster (con jugadores)
const obtenerPorId = (id) => {
    return rosters.find(r => r.id === id);
};

// Crear un roster
const crearRoster = (datos) => {
    const nuevo = {
        id: idActual++,
        nombre: datos.nombre,
        juego: datos.juego,
        tipo: datos.tipo,
        temporada: datos.temporada
    };
    rosters.push(nuevo);
    return nuevo;
};

// Actualizar un roster
const actualizarRoster = (id, datos) => {
    const indice = rosters.findIndex(r => r.id === id);
    if (indice === -1) return null;
    rosters[indice] = {
        id: id,
        nombre: datos.nombre,
        juego: datos.juego,
        tipo: datos.tipo,
        temporada: datos.temporada
    };
    return rosters[indice];
};

// Eliminar un roster
const eliminarRoster = (id) => {
    const indice = rosters.findIndex(r => r.id === id);
    if (indice === -1) return null;
    return rosters.splice(indice, 1)[0];
};

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crearRoster,
    actualizarRoster,
    eliminarRoster
};