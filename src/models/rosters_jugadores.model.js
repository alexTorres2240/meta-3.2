/**
 * Modelo de Rosters_Jugadores (tabla intermedia)
 */

const jugadorModel = require('./jugadores.model');

let asignaciones = [
    { id: 1, id_roster: 1, id_jugador: 1, rol_jugador: 'Titular'},
    { id: 2, id_roster: 1, id_jugador: 2, rol_jugador: 'Titular'},
    { id: 3, id_roster: 1, id_jugador: 3, rol_jugador: 'Titular'},
    { id: 4, id_roster: 1, id_jugador: 4, rol_jugador: 'Titular'},
    { id: 5, id_roster: 1, id_jugador: 5, rol_jugador: 'Titular'}
];

let idActual = 6;

// Listar jugadores en un roster
const listarJugadores = (id_roster) => {
    return asignaciones.filter(a => a.id_roster === id_roster);
};

// Asignar jugador a un roster
const asignarJugador = (datos) => {
    const nueva = {
        id: idActual++,
        id_jugador: datos.id_jugador,
        id_roster: datos.id_roster,
        rol_jugador: datos.rol_jugador
    };
    asignaciones.push(nueva);
    return nueva;
};

// Cambiar rol en roster (Titular/Suplente)
const cambiarRol = (datos) => {
    asignaciones[indice].rol_jugador = datos.rol_jugador;
    return asignaciones[indice];
};

// Quitar jugador del roster
const quitarJugador = (id_roster, id_jugador) => {
    const indice = asignaciones.findIndex(a => a.id_roster === id_roster && a.id_jugador === id_jugador);
    if (indice === -1) return null;
    return asignaciones.splice(indice, 1)[0];
};

module.exports = {
    listarJugadores,
    asignarJugador,
    cambiarRol,
    quitarJugador
};