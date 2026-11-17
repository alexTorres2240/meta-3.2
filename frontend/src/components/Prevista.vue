
<script setup>
import { ref } from 'vue';

defineProps({
    titulo: {
        type: String,
        required: true
    },
    columnas: {
        type: Array,
        required: true
    },
    registros: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['seleccionar']);

const seleccionado = ref(null);

function seleccionarRegistro(registro) {
    seleccionado.value = registro.id;
    emit('seleccionar', registro);
}
</script>

<template>
    <section class="prevista">
        <header class="encabezado">
            <div>
                <h2>{{ titulo }}</h2>
                <p>{{ registros.length }} registros</p>
            </div>
            <div class="acciones">
                <slot name="acciones"></slot>
            </div>
        </header>
        <div class="tabla-contenedor">
            <table>
                <thead>
                    <tr>
                        <th
                            v-for="columna in columnas"
                            :key="columna.campo"
                        >
                            {{ columna.titulo }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="registro in registros"
                        :key="registro.id"
                        class="fila-interactiva"
                        :class="{
                            seleccionada: seleccionado === registro.id
                        }"
                        tabindex="0"
                        :aria-label="`Seleccionar registro ${registro.id}`"
                        @click="seleccionarRegistro(registro)"
                        @keydown.enter="seleccionarRegistro(registro)"
                        @keydown.space.prevent="seleccionarRegistro(registro)"
                    >
                        <td
                            v-for="columna in columnas"
                            :key="columna.campo"
                        >
                            {{ registro[columna.campo] ?? '—' }}
                        </td>
                    </tr>
                    <tr v-if="registros.length === 0">
                        <td
                            :colspan="columnas.length"
                            class="sin-datos"
                        >
                            No hay registros disponibles.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>

<style scoped>
.prevista {
    background: #4b4b4b;
    color: #f5f3ed;
    border: 1px solid #665944;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 25px;
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.24);
}

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.encabezado h2 {
    color: #f0c86d;
    margin: 0;
}

.encabezado p {
    margin: 6px 0 0;
    color: #d2ccc0;
    font-size: 14px;
}

.acciones {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.tabla-contenedor {
    overflow-x: auto;
    border: 1px solid #665944;
    border-radius: 8px;
    background: #383838;
}

table {
    width: 100%;
    border-collapse: collapse;
    color: #f5f3ed;
}

th, td {
    padding: 14px;
    text-align: left;
    border-bottom: 1px solid #625744;
}

th {
    background: #2d2d2d;
    color: #f0c86d;
    font-weight: 600;
}

tbody tr:nth-child(even) td {
    background: #414141;
}

.fila-interactiva {
    cursor: pointer;
    transition: background-color 0.15s;
}

.fila-interactiva:hover,
.fila-interactiva:hover td {
    background: #544932;
}

.fila-interactiva:focus-visible {
    outline: 2px solid #f0c86d;
    outline-offset: -2px;
}

.fila-interactiva.seleccionada,
.fila-interactiva.seleccionada td {
    background: #685431;
    color: #ffffff;
}

.sin-datos {
    text-align: center;
    color: #d2ccc0;
}

@media (max-width: 600px) {
    .encabezado {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
