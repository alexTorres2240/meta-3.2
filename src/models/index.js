const sequelize = require('../config/database');
const Jugador = require('./jugadores.model');
const Roster = require('./rosters.model');
const RosterJugador = require('./rosters_jugadores.model');

Roster.belongsToMany(Jugador, {
    through: RosterJugador,
    foreignKey: 'id_roster',
    otherKey: 'id_jugador',
    as: 'jugadores'
});
Jugador.belongsToMany(Roster, {
    through: RosterJugador,
    foreignKey: 'id_jugador',
    otherKey: 'id_roster',
    as: 'rosters'
});

RosterJugador.belongsTo(Roster, { foreignKey: 'id_roster', onDelete: 'RESTRICT' });
RosterJugador.belongsTo(Jugador, { foreignKey: 'id_jugador', onDelete: 'RESTRICT'});

module.exports = { sequelize, Jugador, Roster, RosterJugador };