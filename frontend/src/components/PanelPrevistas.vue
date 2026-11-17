
<script setup>
import Prevista from './Prevista.vue';


defineProps({
    jugadores: {
        type: Array,
        default: () => []
    },
    rosters: {
        type: Array,
        default: () => []
    },
    esAdmin: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits([
    'actualizar',
    'nuevo-jugador',
    'nuevo-roster',
    'seleccionar-jugador',
    'seleccionar-roster'
]);

const columnasJugadores = [
    { campo: 'id', titulo: 'ID' },
    { campo: 'nickname', titulo: 'Nickname' },
    { campo: 'nombre_real', titulo: 'Nombre real' },
    { campo: 'pais', titulo: 'País' },
    { campo: 'rol', titulo: 'Posición' },
    { campo: 'estado', titulo: 'Estado' }
];

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
        <Prevista
            titulo="Jugadores"
            :columnas="columnasJugadores"
            :registros="jugadores"
            @seleccionar="emit('seleccionar-jugador', $event)"
        >
            <template #acciones>
                <button
                    v-if="esAdmin"
                    class="btn principal"
                    @click="emit('nuevo-jugador')"
                >
                    + Nuevo jugador
                </button>
            </template>
        </Prevista>
        <Prevista
            titulo="Rosters"
            :columnas="columnasRosters"
            :registros="rosters"
            @seleccionar="emit('seleccionar-roster', $event)"
        >
            <template #acciones>
                <button
                    v-if="esAdmin"
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
    border: 1px solid transparent;
    border-radius: 7px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s, transform 0.15s;
}

.principal {
    background: #c79b3b;
    color: #212121;
}

.principal:hover:not(:disabled) {
    background: #e2b85a;
    transform: translateY(-1px);
}

.secundario {
    background: #626262;
    color: #ffffff;
    border-color: #858585;
}

.secundario:hover:not(:disabled) {
    background: #747474;
}

.btn:focus-visible {
    outline: 2px solid #f0c86d;
    outline-offset: 3px;
}

.btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}
</style>
