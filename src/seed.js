/**
 * Datos iniciales (los mismos que tenía la versión en memoria).
 * Solo se insertan si las tablas están vacías.
 */
const { Jugador, Roster, RosterJugador } = require('./models');

const sembrarDatosIniciales = async () => {
    if ((await Jugador.count()) > 0 || (await Roster.count()) > 0) return;

    await Jugador.bulkCreate([
        { id: 1, nickname: 'Dexter', nombre_real: 'Michael Williams', pais: 'Estados Unidos', rol: 'Jungle', estado: 'activo' },
        { id: 2, nickname: 'Zatanaz', nombre_real: 'Valentin Lopez', pais: 'Mexico', rol: 'Mid', estado: 'activo' },
        { id: 3, nickname: 'Mecha', nombre_real: 'Haruto Tanaka', pais: 'Japon', rol: 'Top', estado: 'activo' },
        { id: 4, nickname: 'Lion', nombre_real: 'Wei Zhang', pais: 'China', rol: 'ADC', estado: 'activo' },
        { id: 5, nickname: 'Beatle', nombre_real: 'Oliver Smith', pais: 'Inglaterra', rol: 'Support', estado: 'activo' }
    ]);

    await Roster.create({ id: 1, nombre: 'Warriors', juego: 'League Of Legends', tipo: 'Principal', temporada: '2026' });

    await RosterJugador.bulkCreate([1, 2, 3, 4, 5].map(id_jugador => ({
        id_roster: 1,
        id_jugador,
        rol_jugador: 'Titular'
    })));

    console.log('Datos iniciales cargados');
};

module.exports = sembrarDatosIniciales;
