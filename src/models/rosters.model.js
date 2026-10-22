const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Roster = sequelize.define('Roster', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    juego: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('Principal', 'Academia'),
        allowNull: false
    },
    temporada: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'rosters'
});

module.exports = Roster;