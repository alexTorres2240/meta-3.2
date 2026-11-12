
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('rosters_jugadores', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_roster: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'rosters',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            id_jugador: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'jugadores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            rol_en_roster: {
                type: Sequelize.ENUM('Titular', 'Suplente'),
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

        await queryInterface.addIndex(
            'rosters_jugadores',
            ['id_roster', 'id_jugador'],
            {
                unique: true,
                name: 'uq_rosters_jugadores'
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable('rosters_jugadores');
    }
};
