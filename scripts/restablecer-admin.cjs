
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { randomBytes } = require('node:crypto');
const readline = require('node:readline/promises');

const { sequelize, Usuario } = require('../src/models/index.js');

async function restablecerPassword() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const correo = (await rl.question(
            'Correo del administrador: '
        )).trim().toLowerCase();

        await sequelize.authenticate();

        // Buscar el administrador en MySQL
        const admin = await Usuario.findOne({
            where: {
                correo,
                rol: 'admin'
            }
        });

        if (!admin) {
            console.log('Administrador no encontrado.');
            return;
        }

        // Generar nueva contraseña aleatoria
        const nuevaPassword = randomBytes(24).toString('base64url');

        // Encriptar mediante hash bcrypt
        const nuevoHash = await bcrypt.hash(nuevaPassword, 12);

        // Actualizar el registro existente
        await admin.update({
            password_hash: nuevoHash
        });

        console.log('\n¡Contraseña actualizada correctamente!');
        console.log('Correo:', admin.correo);
        console.log('Nueva contraseña:', nuevaPassword);
        console.log('\nGuarda esta contraseña en un lugar seguro.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        rl.close();
        await sequelize.close();
    }
}

restablecerPassword();
