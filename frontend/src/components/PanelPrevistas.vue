
<script setup>
import Prevista from './Prevista.vue';

// Datos recibidos desde App.vue
defineProps({
    jugadores: {
        type: Array,
        default: () => []
    },
    rosters: {
        type: Array,
        default: () => []
    }
});

// Eventos disponibles para futuras funciones
const emit = defineEmits([
    'actualizar',
    'nuevo-jugador',
    'nuevo-roster',
    'seleccionar-jugador',
    'seleccionar-roster'
]);

// Columnas para los jugadores
const columnasJugadores = [
    { campo: 'id', titulo: 'ID' },
    { campo: 'nickname', titulo: 'Nickname' },
    { campo: 'nombre_real', titulo: 'Nombre real' },
    { campo: 'pais', titulo: 'País' },
    { campo: 'rol', titulo: 'Posición' },
    { campo: 'estado', titulo: 'Estado' }
];

// Columnas para los rosters
const columnasRosters = [
    { campo: 'id', titulo: 'ID' },
    { campo: 'nombre', titulo: 'Nombre' },
    { campo: 'juego', titulo: 'Juego' },
    { campo: 'tipo', titulo: 'Tipo' },
    { campo: 'temporada', titulo: 'Temporada' }
];
</script>

<template>
    <div>
        <!-- TABLA DE JUGADORES -->
        <Prevista
            titulo="Jugadores"
            :columnas="columnasJugadores"
            :registros="jugadores"
            @seleccionar="emit('seleccionar-jugador', $event)"
        >
            <template #acciones>
                <button
                    class="btn principal"
                    @click="emit('nuevo-jugador')"
                >
                    + Nuevo jugador
                </button>
            </template>
        </Prevista>

        <!-- TABLA DE ROSTERS -->
        <Prevista
            titulo="Rosters"
            :columnas="columnasRosters"
            :registros="rosters"
            @seleccionar="emit('seleccionar-roster', $event)"
        >
            <template #acciones>
                <button
                    class="btn principal"
                    @click="emit('nuevo-roster')"
                >
                    + Nuevo roster
                </button>

            </template>
        </Prevista>
    </div>
</template>

<style scoped>
.btn {
    padding: 10px 16px;
    border: none;
    border-radius: 7px;
    font-size: 14px;
    cursor: pointer;
}

.principal {
    background: #2563eb;
    color: white;
}

.secundario {
    background: #e2e8f0;
    color: #334155;
}

.btn:hover {
    opacity: 0.85;
}
</style>
