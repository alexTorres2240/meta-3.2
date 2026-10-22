const app = require('./src/app');
const { sequelize } = require('./src/models');
const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida.');
        await sequelize.sync();
        console.log('Tablas sincronizadas.');
        app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
    } catch (error) {
        console.error('Error al iniciar el servidor: ', error);
        process.exit(1);
    }
}

iniciarServidor();