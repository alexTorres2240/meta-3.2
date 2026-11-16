
'use strict';

module.exports = {

    async up(queryInterface, Sequelize) {

        // Agregar identificador de Google
        await queryInterface.addColumn('usuarios', 'google_sub', {
            type: Sequelize.STRING(255),
            allowNull: true,
            unique: true
        });

        // Permitir usuarios sin contraseña local
        await queryInterface.changeColumn(
            'usuarios',
            'password_hash',
            {
                type: Sequelize.STRING,
                allowNull: true
            }
        );
    },

    async down(queryInterface, Sequelize) {

        // No revertir mientras existan usuarios
        // registrados exclusivamente con Google
        const [filas] = await queryInterface.sequelize.query(
            'SELECT COUNT(*) AS total FROM usuarios WHERE password_hash IS NULL'
        );

        if (Number(filas[0].total) > 0) {
            throw new Error(
                'Existen usuarios Google sin contraseña local.'
            );
        }

        await queryInterface.changeColumn(
            'usuarios',
            'password_hash',
            {
                type: Sequelize.STRING,
                allowNull: false
            }
        );

        await queryInterface.removeColumn(
            'usuarios',
            'google_sub'
        );
    }

};
