require('dotenv').config();

const readline = require('node:readline/promises');
const { randomBytes } = require('node:crypto');
const bcrypt = require('bcryptjs');

const { sequelize, Usuario } = require('../src/models/index.js');

async function crearAdmin() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const nombre = (await rl.question('Nombre del Admin: ')).trim();
        const correo = (await rl.question('Correo: ')).trim().toLowerCase();

        if (!nombre || !correo || !correo.includes('@')) {
            throw new Error('Nombre o correo no válido');
        }

        await sequelize.authenticate();

        const existente = await Usuario.findOne({
            where: { correo }
        });

        if (existente) {
            throw new Error('Ese correo ya está registrado');
        }

        // Generar contraseña temporal aleatoria
        const password = randomBytes(24).toString('base64url');

        // Crear hash seguro
        const password_hash = await bcrypt.hash(password, 12);

        await Usuario.create({
            nombre,
            correo,
            password_hash,
            rol: 'admin',
            activo: true
        });

        console.log('\nAdministrador creado correctamente.');
        console.log('Correo:', correo);
        console.log('Contraseña temporal:', password);
        console.log('Guarda esta contraseña en un lugar seguro.');
    } finally {
        rl.close();
        await sequelize.close();
    }
}

crearAdmin().catch(error => {
    console.error('Error:', error.message);
    process.exitCode = 1;
});
