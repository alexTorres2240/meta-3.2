/**
 * Conexión a la base de datos con Sequelize.
 *
 * Por defecto usa SQLite (un archivo local, sin instalar nada).
 * Para usar MySQL/PostgreSQL basta con definir variables de entorno:
 *   DB_DIALECT=mysql | postgres
 *   DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
 * (y instalar el driver: `npm i mysql2` o `npm i pg pg-hstore`)
 */
const path = require('path');
const { Sequelize } = require('sequelize');

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.DB_STORAGE || path.join(__dirname, '..', '..', 'database.sqlite'),
        logging: false
    });
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT,
            dialect,
            logging: false
        }
    );
}

module.exports = sequelize;
