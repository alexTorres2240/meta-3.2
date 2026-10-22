const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RosterJugador = sequelize.define('RosterJugador', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_roster: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'rosters', key: 'id' }
    },
    id_jugador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'jugadores', key: 'id'}
    },
    rol_en_roster: {
        type: DataTypes.ENUM('Titular', 'Suplente'),
        allowNull: false
    },
}, {
    tableName: 'rosters_jugadores',
    indexes: [
        { unique: true, fields: ['id_roster', 'id_jugador'] }
    ]
});

module.exports = RosterJugador;