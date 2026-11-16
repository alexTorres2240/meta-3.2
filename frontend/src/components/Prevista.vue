
<script setup>
import { ref } from 'vue';

// Información que recibimos del componente padre
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

// Evento que se enviará al seleccionar un registro
const emit = defineEmits(['seleccionar']);

// Registro seleccionado
const seleccionado = ref(null);

function seleccionarRegistro(registro) {
    seleccionado.value = registro.id;

    // Avisar al componente padre
    emit('seleccionar', registro);
}
</script>

<template>
    <section class="prevista">
        <!-- Encabezado -->
        <header class="encabezado">
            <div>
                <h2>{{ titulo }}</h2>
                <p>{{ registros.length }} registros</p>
            </div>

            <!-- Espacio para botones personalizados -->
            <div class="acciones">
                <slot name="acciones"></slot>
            </div>
        </header>

        <!-- Tabla -->
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
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 25px;
    box-shadow: 0 3px 15px #00000014;
}

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.encabezado h2 {
    margin: 0;
}

.encabezado p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 14px;
}

.acciones {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.tabla-contenedor {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 14px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

th {
    background: #f8fafc;
    color: #475569;
}

.fila-interactiva {
    cursor: pointer;
    transition: background 0.15s;
}

.fila-interactiva:hover {
    background: #eff6ff;
}

.fila-interactiva:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: -2px;
}

.fila-interactiva.seleccionada {
    background: #dbeafe;
}

.sin-datos {
    text-align: center;
    color: #64748b;
}

@media (max-width: 600px) {
    .encabezado {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
