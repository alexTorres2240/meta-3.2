
'use strict';

const { QueryTypes, Op } = require('sequelize');

// Jugadores que vamos a insertar
const jugadores = [
    {
        nickname: 'Dexter',
        nombre_real: 'Michael Williams',
        pais: 'Estados Unidos',
        rol: 'Jungle',
        estado: 'activo'
    },
    {
        nickname: 'Zatanaz',
        nombre_real: 'Valentin Lopez',
        pais: 'Mexico',
        rol: 'Mid',
        estado: 'activo'
    },
    {
        nickname: 'Mecha',
        nombre_real: 'Haruto Tanaka',
        pais: 'Japon',
        rol: 'Top',
        estado: 'activo'
    },
    {
        nickname: 'Lion',
        nombre_real: 'Wei Zhang',
        pais: 'China',
        rol: 'ADC',
        estado: 'activo'
    },
    {
        nickname: 'Beatle',
        nombre_real: 'Oliver Smith',
        pais: 'Inglaterra',
        rol: 'Support',
        estado: 'activo'
    }
];

const nombres = jugadores.map(j => j.nickname);

// Buscar los IDs reales de los jugadores
const obtenerJugadores = (sequelize, transaction) =>
    sequelize.query(
        'SELECT id, nickname FROM jugadores WHERE nickname IN (:nombres)',
        {
            replacements: { nombres },
            type: QueryTypes.SELECT,
            transaction
        }
    );

// Buscar el ID real del roster
const obtenerRoster = (sequelize, transaction) =>
    sequelize.query(
        'SELECT id FROM rosters WHERE nombre = :nombre AND temporada = :temporada',
        {
            replacements: {
                nombre: 'Warriors',
                temporada: '2026'
            },
            type: QueryTypes.SELECT,
            transaction
        }
    );

module.exports = {

    // INSERTAR DATOS
    async up(queryInterface) {
        const sequelize = queryInterface.sequelize;

        await sequelize.transaction(async transaction => {

            // Evitar conflictos con datos existentes
            const existentes = await obtenerJugadores(sequelize, transaction);
            const rostersExistentes = await obtenerRoster(sequelize, transaction);

            if (existentes.length || rostersExistentes.length) {
                throw new Error('Ya existen datos con esos nombres. No se insertaron registros.');
            }

            const ahora = new Date();

            // 1. Insertar jugadores
            await queryInterface.bulkInsert(
                'jugadores',
                jugadores.map(j => ({
                    ...j,
                    createdAt: ahora,
                    updatedAt: ahora
                })),
                { transaction }
            );

            // 2. Insertar roster
            await queryInterface.bulkInsert('rosters', [{
                nombre: 'Warriors',
                juego: 'League Of Legends',
                tipo: 'Principal',
                temporada: '2026',
                createdAt: ahora,
                updatedAt: ahora
            }], { transaction });

            // 3. Recuperar identificadores generados
            const creados = await obtenerJugadores(sequelize, transaction);
            const [roster] = await obtenerRoster(sequelize, transaction);

            // 4. Asignar los cinco jugadores como titulares
            await queryInterface.bulkInsert(
                'rosters_jugadores',
                creados.map(j => ({
                    id_roster: roster.id,
                    id_jugador: j.id,
                    rol_en_roster: 'Titular',
                    createdAt: ahora,
                    updatedAt: ahora
                })),
                { transaction }
            );
        });
    },

    // REVERTIR DATOS
    async down(queryInterface) {
        const sequelize = queryInterface.sequelize;

        await sequelize.transaction(async transaction => {

            const creados = await obtenerJugadores(sequelize, transaction);
            const [roster] = await obtenerRoster(sequelize, transaction);

            // Eliminar primero las asignaciones
            if (roster) {
                if (creados.length) {
                    await queryInterface.bulkDelete(
                        'rosters_jugadores',
                        {
                            id_roster: roster.id,
                            id_jugador: {
                                [Op.in]: creados.map(j => j.id)
                            }
                        },
                        { transaction }
                    );
                }

                // Eliminar roster
                await queryInterface.bulkDelete(
                    'rosters',
                    { id: roster.id },
                    { transaction }
                );
            }

            // Eliminar jugadores de demostración
            await queryInterface.bulkDelete(
                'jugadores',
                { nickname: { [Op.in]: nombres } },
                { transaction }
            );
        });
    }
};
