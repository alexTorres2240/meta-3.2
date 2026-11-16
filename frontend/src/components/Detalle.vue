
<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { api } from '../services/api.js';
import IntegrantesRoster from './IntegrantesRoster.vue';

const props = defineProps({
    tipo: {
        type: String,
        required: true,
        validator: v => ['jugador', 'roster'].includes(v)
    },
    registro: {
        type: Object,
        required: true
    }
});

const emit = defineEmits([
    'cerrar',
    'actualizado',
    'eliminado',
    'asignaciones-cambiadas'
]);

const editando = ref(false);
const procesando = ref(false);
const error = ref('');
const ventana = ref(null);

const camposJugador = [
    { clave: 'nickname', titulo: 'Nickname' },
    { clave: 'nombre_real', titulo: 'Nombre real' },
    { clave: 'pais', titulo: 'País' },
    {
        clave: 'rol',
        titulo: 'Posición',
        opciones: ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
    },
    {
        clave: 'estado',
        titulo: 'Estado',
        opciones: ['activo', 'inactivo']
    }
];

const camposRoster = [
    { clave: 'nombre', titulo: 'Nombre' },
    { clave: 'juego', titulo: 'Juego' },
    {
        clave: 'tipo',
        titulo: 'Tipo',
        opciones: ['Principal', 'Academia']
    },
    { clave: 'temporada', titulo: 'Temporada' }
];

const campos = computed(() =>
    props.tipo === 'jugador' ? camposJugador : camposRoster
);

const formulario = reactive(
    props.tipo === 'jugador'
        ? {
            nickname: props.registro.nickname ?? '',
            nombre_real: props.registro.nombre_real ?? '',
            pais: props.registro.pais ?? '',
            rol: props.registro.rol ?? '',
            estado: props.registro.estado ?? ''
        }
        : {
            nombre: props.registro.nombre ?? '',
            juego: props.registro.juego ?? '',
            tipo: props.registro.tipo ?? '',
            temporada: props.registro.temporada ?? ''
        }
);

const ruta = computed(() =>
    props.tipo === 'jugador'
        ? `/jugadores/${props.registro.id}`
        : `/rosters/${props.registro.id}`
);

// Cerrar ventana
function cerrar() {
    if (!procesando.value) {
        emit('cerrar');
    }
}

function activarEdicion() {
    error.value = '';
    editando.value = true;
}

function cancelarEdicion() {
    for (const campo of campos.value) {
        formulario[campo.clave] =
            props.registro[campo.clave] ?? '';
    }

    editando.value = false;
    error.value = '';
}

async function guardarCambios() {
    if (procesando.value) return;

    error.value = '';
    procesando.value = true;

    try {
        const datos = {};

        for (const campo of campos.value) {
            const valor = formulario[campo.clave];

            datos[campo.clave] =
                typeof valor === 'string'
                    ? valor.trim()
                    : valor;
        }

        if (Object.values(datos).some(v => !String(v).trim())) {
            throw new Error('Todos los campos son obligatorios.');
        }

        const respuesta = await api(ruta.value, {
            method: 'PUT',
            body: datos
        });

        if (respuesta?.success !== true) {
            throw new Error('No se pudo actualizar el registro.');
        }

        emit('actualizado');

    } catch (err) {
        error.value = err.message ||
            'Error al actualizar el registro.';
    } finally {
        procesando.value = false;
    }
}

async function eliminarRegistro() {
    if (procesando.value) return;

    const nombre = props.tipo === 'jugador'
        ? props.registro.nickname
        : props.registro.nombre;

    const confirmado = window.confirm(
        `¿Estás seguro de eliminar "${nombre}"?\n` +
        'Esta acción no se puede deshacer.'
    );

    if (!confirmado) return;

    error.value = '';
    procesando.value = true;

    try {
        await api(ruta.value, {
            method: 'DELETE'
        });

        emit('eliminado');

    } catch (err) {
        error.value = err.message ||
            'Error al eliminar el registro.';
    } finally {
        procesando.value = false;
    }
}

onMounted(() => {
    ventana.value?.focus();
});
</script>

<template>
    <Teleport to="body">
        <div
            class="fondo-modal"
            @click.self="cerrar"
        >
            <section
                ref="ventana"
                class="modal"
                :class="{ 'modal-roster': tipo === 'roster' }"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-detalle"
                tabindex="-1"
                @keydown.esc="cerrar"
            >
                <!-- ENCABEZADO -->
                <header class="encabezado">
                    <div>
                        <h2 id="titulo-detalle">
                            {{ editando ? 'Editar' : 'Detalle de' }}
                            {{ tipo }}
                        </h2>

                        <p>
                            Registro #{{ registro.id }}
                        </p>
                    </div>

                    <button
                        type="button"
                        class="cerrar"
                        aria-label="Cerrar"
                        :disabled="procesando"
                        @click="cerrar"
                    >
                        &times;
                    </button>
                </header>
                
                <!-- MODO CONSULTA -->
                <div v-if="!editando">

                    <!-- Información del registro -->
                    <div class="datos">
                        <div
                            v-for="campo in campos"
                            :key="campo.clave"
                            class="dato"
                        >
                            <span class="etiqueta">
                                {{ campo.titulo }}
                            </span>

                            <span class="valor">
                                {{ registro[campo.clave] ?? '—' }}
                            </span>
                        </div>
                    </div>

                    <!-- Solo aparece cuando consultamos un roster -->
                    <IntegrantesRoster
                        v-if="tipo === 'roster'"
                        :roster-id="registro.id"
                        @cambiado="emit('asignaciones-cambiadas')"
                    />

                </div>

                <!-- MODO EDICIÓN -->
                <form
                    v-else
                    id="formulario-editar"
                    @submit.prevent="guardarCambios"
                >
                    <div
                        v-for="campo in campos"
                        :key="campo.clave"
                        class="campo"
                    >
                        <label :for="`editar-${campo.clave}`">
                            {{ campo.titulo }}
                        </label>

                        <select
                            v-if="campo.opciones"
                            :id="`editar-${campo.clave}`"
                            v-model="formulario[campo.clave]"
                            required
                        >
                            <option
                                v-for="opcion in campo.opciones"
                                :key="opcion"
                                :value="opcion"
                            >
                                {{ opcion }}
                            </option>
                        </select>

                        <input
                            v-else
                            :id="`editar-${campo.clave}`"
                            v-model="formulario[campo.clave]"
                            type="text"
                            maxlength="255"
                            required
                        />
                    </div>
                </form>

                <!-- ERRORES DEL BACKEND -->
                <p v-if="error" class="error" role="alert">
                    {{ error }}
                </p>

                <!-- BOTONES -->
                <footer class="acciones">
                    <template v-if="!editando">
                        <button
                            type="button"
                            class="btn eliminar"
                            :disabled="procesando"
                            @click="eliminarRegistro"
                        >
                            Eliminar
                        </button>

                        <button
                            type="button"
                            class="btn editar"
                            :disabled="procesando"
                            @click="activarEdicion"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="btn secundario"
                            :disabled="procesando"
                            @click="cerrar"
                        >
                            Cerrar
                        </button>
                    </template>

                    <template v-else>
                        <button
                            type="button"
                            class="btn secundario"
                            :disabled="procesando"
                            @click="cancelarEdicion"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            form="formulario-editar"
                            class="btn editar"
                            :disabled="procesando"
                        >
                            {{ procesando
                                ? 'Guardando...'
                                : 'Guardar cambios' }}
                        </button>
                    </template>
                </footer>
            </section>
        </div>
    </Teleport>
</template>

<style scoped>
.fondo-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    overflow-y: auto;
}

.modal {
    background: white;
    width: 100%;
    max-width: 500px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    padding: 28px;
    border-radius: 14px;
    box-shadow: 0 12px 35px #00000030;
    box-sizing: border-box;
    color: #1e293b;
}

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 25px;
    gap: 15px;
}

.encabezado h2 {
    margin: 0;
    text-transform: capitalize;
}

.encabezado p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 14px;
}

.cerrar {
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 28px;
    cursor: pointer;
    padding: 0 4px;
}

.datos {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-bottom: 26px;
}

.dato {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
}

.etiqueta {
    color: #64748b;
    font-size: 13px;
}

.valor {
    font-size: 15px;
    font-weight: 600;
    overflow-wrap: anywhere;
}

.campo {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 16px;
}

.campo label {
    font-size: 14px;
    font-weight: 600;
}

.campo input,
.campo select {
    padding: 11px;
    border: 1px solid #cbd5e1;
    border-radius: 7px;
    font-size: 15px;
    background: white;
    color: #1e293b;
    width: 100%;
    box-sizing: border-box;
}

.campo input:focus,
.campo select:focus {
    outline: 2px solid #93c5fd;
}

.acciones {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    flex-wrap: wrap;
    margin-top: 20px;
}

.btn {
    padding: 11px 16px;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    font-size: 14px;
}

.editar {
    background: #2563eb;
    color: white;
}

.eliminar {
    background: #dc2626;
    color: white;
}

.secundario {
    background: #e2e8f0;
    color: #334155;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.error {
    background: #fef2f2;
    color: #b91c1c;
    padding: 12px;
    border-radius: 7px;
    font-size: 14px;
}

@media (max-width: 500px) {
    .datos {
        grid-template-columns: 1fr;
    }
}

.modal.modal-roster {
    max-width: 850px;
}
</style>
