
import 'dotenv/config';
import app from './src/app.js';
import modelos from './src/models/index.js';

const { sequelize } = modelos;

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await sequelize.authenticate();

        console.log('Conexión a MySQL establecida correctamente.');

        app.listen(PORT, () => {
            console.log(`API en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

iniciarServidor();
