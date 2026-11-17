
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('usuarios', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            nombre: {
                type: Sequelize.STRING,
                allowNull: false
            },
            correo: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password_hash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            rol: {
                type: Sequelize.ENUM('admin', 'usuario'),
                allowNull: false,
                defaultValue: 'usuario'
            },
            activo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },
    
    async down(queryInterface) {
        await queryInterface.dropTable('usuarios');
    }
};
