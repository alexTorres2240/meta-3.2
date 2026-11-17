
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
    },
    esAdmin: {
        type: Boolean,
        default: false
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

function cerrar() {
    if (!procesando.value) {
        emit('cerrar');
    }
}

function activarEdicion() {
    if (!props.esAdmin) return;
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
    if (!props.esAdmin) return;
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
    if (!props.esAdmin) return;
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
                <div v-if="!editando">
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
                    <IntegrantesRoster
                        v-if="tipo === 'roster'"
                        :roster-id="registro.id"
                        :es-admin="esAdmin"
                        @cambiado="emit('asignaciones-cambiadas')"
                    />
                </div>
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
                <p v-if="error" class="error" role="alert">
                    {{ error }}
                </p>
                <footer class="acciones">
                    <template v-if="!editando">
                        <button
                            v-if="esAdmin"
                            type="button"
                            class="btn eliminar"
                            :disabled="procesando"
                            @click="eliminarRegistro"
                        >
                            Eliminar
                        </button>
                        <button
                            v-if="esAdmin"
                            type="button"
                            class="btn editar"
                            :disabled="procesando"
                            @click="activarEdicion"
                        >
                            Editar
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
    background: rgba(0, 0, 0, 0.78);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    overflow-y: auto;
}

.modal {
    background: #4b4b4b;
    width: 100%;
    max-width: 500px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    padding: 28px;
    border-radius: 14px;
    border: 1px solid #78613b;
    box-shadow: 0 18px 55px rgba(0, 0, 0, 0.55);
    box-sizing: border-box;
    color: #f5f3ed;
    font-family: Arial, sans-serif;
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
    color: #f0c86d;
}

.encabezado p {
    margin: 6px 0 0;
    color: #d2ccc0;
    font-size: 14px;
}

.cerrar {
    border: none;
    background: transparent;
    color: #e5c071;
    font-size: 28px;
    cursor: pointer;
    padding: 0 4px;
}

.cerrar:hover:not(:disabled) {
    color: #ffffff;
}

.datos {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 26px;
}

.dato {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #655a48;
    background: #383838;
}

.etiqueta {
    color: #f0c86d;
    font-size: 13px;
    font-weight: 600;
}

.valor {
    color: #ffffff;
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
    color: #f0c86d;
}

.campo input,
.campo select {
    padding: 11px;
    border: 1px solid #837356;
    border-radius: 7px;
    font-size: 15px;
    background: #333333;
    color: #ffffff;
    color-scheme: dark;
    width: 100%;
    box-sizing: border-box;
}

.campo input:focus,
.campo select:focus {
    outline: 2px solid #e2b85a;
    outline-offset: 1px;
    border-color: #e2b85a;
}

.acciones {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    flex-wrap: wrap;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #69604e;
}

.btn {
    padding: 11px 16px;
    border: 1px solid transparent;
    border-radius: 7px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.15s;
}

.editar {
    background: #c79b3b;
    color: #212121;
}

.editar:hover:not(:disabled) {
    background: #e2b85a;
}

.eliminar {
    background: #803b3b;
    color: #ffffff;
    border-color: #bd6868;
}

.eliminar:hover:not(:disabled) {
    background: #994545;
}

.secundario {
    background: #626262;
    color: #ffffff;
    border-color: #858585;
}

.secundario:hover:not(:disabled) {
    background: #747474;
}

.btn:focus-visible,
.cerrar:focus-visible {
    outline: 2px solid #f0c86d;
    outline-offset: 3px;
}

.btn:disabled,
.cerrar:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.error {
    background: #4d2b2b;
    color: #ffb4af;
    border: 1px solid #a75a5a;
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
