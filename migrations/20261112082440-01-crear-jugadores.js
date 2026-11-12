
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('jugadores', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            nickname: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            nombre_real: {
                type: Sequelize.STRING,
                allowNull: false
            },
            pais: {
                type: Sequelize.STRING,
                allowNull: false
            },
            rol: {
                type: Sequelize.ENUM(
                    'Top', 'Jungle', 'Mid', 'ADC', 'Support'
                ),
                allowNull: false
            },
            estado: {
                type: Sequelize.ENUM('activo', 'inactivo'),
                allowNull: false
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
        await queryInterface.dropTable('jugadores');
    }
};
