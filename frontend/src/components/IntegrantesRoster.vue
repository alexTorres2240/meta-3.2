
<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { api } from '../services/api.js';

const props = defineProps({
    rosterId: {
        type: [Number, String],
        required: true
    },
    esAdmin: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['cambiado']);

const integrantes = ref([]);
const disponibles = ref([]);

const jugadorSeleccionado = ref('');
const rolSeleccionado = ref('Suplente');

const cargando = ref(false);
const guardando = ref(false);
const quitandoId = ref(null);

const error = ref('');
const mensaje = ref('');

const rolesTemporales = reactive({});
const actualizandoId = ref(null);

const ruta = computed(() =>
    `/rosters/${props.rosterId}/jugadores`
);


async function cargarDatos() {
    cargando.value = true;
    error.value = '';
    try {
        const respuestaRoster = await api(ruta.value);
        integrantes.value = respuestaRoster.jugadores ?? [];
        disponibles.value = [];
        if (props.esAdmin) {
            const respuestaDisponibles =
                await api('/jugadores/disponibles');
            disponibles.value =
                respuestaDisponibles.jugadores ?? [];
        }
        Object.keys(rolesTemporales).forEach(id => {
            delete rolesTemporales[id];
        });
        integrantes.value.forEach(asignacion => {
            rolesTemporales[asignacion.id_jugador] =
                asignacion.rol_en_roster;
        });
    } catch (err) {
        error.value = err.message;
    } finally {
        cargando.value = false;
    }
}

async function agregarJugador() {
    if (!props.esAdmin) return;
    if (!jugadorSeleccionado.value) {
        error.value = 'Selecciona un jugador.';
        return;
    }
    guardando.value = true;
    error.value = '';
    mensaje.value = '';
    try {
        await api(ruta.value, {
            method: 'POST',
            body: {
                id_jugador: Number(jugadorSeleccionado.value),
                rol_en_roster: rolSeleccionado.value
            }
        });
        jugadorSeleccionado.value = '';
        rolSeleccionado.value = 'Suplente';
        await cargarDatos();
        mensaje.value = 'Jugador agregado correctamente.';
        emit('cambiado');
    } catch (err) {
        error.value = err.message;
    } finally {
        guardando.value = false;
    }
}

async function cambiarRol(asignacion) {
    if (!props.esAdmin) return;
    if (
        actualizandoId.value !== null ||
        guardando.value ||
        quitandoId.value !== null
    ) {
        return;
    }
    const idJugador = asignacion.id_jugador;
    const nuevoRol = rolesTemporales[idJugador];
    if (nuevoRol === asignacion.rol_en_roster) {
        return;
    }
    error.value = '';
    mensaje.value = '';
    actualizandoId.value = idJugador;
    try {
        const respuesta = await api(
            `${ruta.value}/${idJugador}`,
            {
                method: 'PUT',
                body: {
                    rol_en_roster: nuevoRol
                }
            }
        );
        if (respuesta?.success !== true) {
            throw new Error(
                'No se pudo actualizar el rol del jugador.'
            );
        }
        await cargarDatos();
        mensaje.value = 'Rol actualizado correctamente.';
        emit('cambiado');
    } catch (err) {
        error.value = err.message ||
            'Error al cambiar el rol del jugador.';
    } finally {
        actualizandoId.value = null;
    }
}

async function quitarJugador(asignacion) {
    if (!props.esAdmin) return;
    const nombre = asignacion.Jugador?.nickname ?? 'este jugador';
    const confirmar = window.confirm(
        `¿Quitar a ${nombre} de este roster?\n` +
        'El jugador seguirá registrado en MySQL.'
    );
    if (!confirmar) return;
    error.value = '';
    mensaje.value = '';
    quitandoId.value = asignacion.id_jugador;
    try {
        await api(
            `${ruta.value}/${asignacion.id_jugador}`,
            { method: 'DELETE' }
        );
        await cargarDatos();
        mensaje.value = 'Jugador retirado del roster.';
        emit('cambiado');
    } catch (err) {
        error.value = err.message;
    } finally {
        quitandoId.value = null;
    }
}

onMounted(cargarDatos);
</script>

<template>
    <section class="integrantes">
        <header class="encabezado">
            <div>
                <h3>Jugadores del roster</h3>
                <p>{{ integrantes.length }} jugadores asignados</p>
            </div>

            <button
                type="button"
                class="btn secundario"
                :disabled="cargando || guardando"
                @click="cargarDatos"
            >
                Actualizar
            </button>
        </header>
        <div class="tabla-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Nickname</th>
                        <th>Posición</th>
                        <th>Rol en roster</th>
                        <th v-if="esAdmin">Acción</th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                        v-for="asignacion in integrantes"
                        :key="asignacion.id"
                    >
                        <td>
                            {{ asignacion.Jugador?.nickname ?? '—' }}
                        </td>

                        <td>
                            {{ asignacion.Jugador?.rol ?? '—' }}
                        </td>
                        <td>
                            <select
                                v-if="esAdmin"
                                v-model="rolesTemporales[asignacion.id_jugador]"
                                class="rol-selector"
                                :disabled="
                                    guardando ||
                                    quitandoId !== null ||
                                    actualizandoId !== null
                                "
                            >
                                <option value="Titular">Titular</option>
                                <option value="Suplente">Suplente</option>
                            </select>
                            <span
                                v-else
                                :class="['rol', asignacion.rol_en_roster]"
                            >
                                {{ asignacion.rol_en_roster }}
                            </span>
                        </td>
                        <td v-if="esAdmin">
                            <div class="acciones-fila">
                                <button
                                    type="button"
                                    class="btn guardar-rol"
                                    :disabled="
                                        guardando ||
                                        quitandoId !== null ||
                                        actualizandoId !== null ||
                                        rolesTemporales[asignacion.id_jugador]
                                            === asignacion.rol_en_roster
                                    "
                                    @click="cambiarRol(asignacion)"
                                >
                                    {{
                                        actualizandoId === asignacion.id_jugador
                                            ? 'Guardando...'
                                            : 'Guardar'
                                    }}
                                </button>
                                <button
                                    type="button"
                                    class="btn quitar"
                                    :disabled="
                                        quitandoId !== null ||
                                        guardando ||
                                        actualizandoId !== null
                                    "
                                    @click="quitarJugador(asignacion)"
                                >
                                    {{
                                        quitandoId === asignacion.id_jugador
                                            ? 'Quitando...'
                                            : 'Quitar'
                                    }}
                                </button>

                            </div>
                        </td>
                    </tr>
                    <tr v-if="integrantes.length === 0">
                        <td :colspan="esAdmin ? 4 : 3" class="vacio">
                            {{
                                cargando
                                    ? 'Cargando jugadores...'
                                    : 'Este roster no tiene jugadores.'
                            }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-if="esAdmin" class="agregar">
            <h3>Agregar jugador existente</h3>
            <p class="descripcion">
                Solo aparecen jugadores activos que no
                pertenecen a ningún roster.
            </p>
            <form @submit.prevent="agregarJugador">
                <div class="campos">
                    <div class="campo">
                        <label for="jugador-disponible">
                            Jugador disponible
                        </label>
                        <select
                            id="jugador-disponible"
                            v-model="jugadorSeleccionado"
                            required
                            :disabled="cargando || guardando"
                        >
                            <option value="" disabled>
                                Selecciona un jugador
                            </option>
                            <option
                                v-for="jugador in disponibles"
                                :key="jugador.id"
                                :value="jugador.id"
                            >
                                {{ jugador.nickname }} — {{ jugador.rol }}
                            </option>
                        </select>
                    </div>
                    <div class="campo">
                        <label for="rol-nuevo">
                            Rol en el roster
                        </label>
                        <select
                            id="rol-nuevo"
                            v-model="rolSeleccionado"
                            :disabled="guardando"
                        >
                            <option value="Titular">Titular</option>
                            <option value="Suplente">Suplente</option>
                        </select>
                    </div>
                </div>
                <button
                    type="submit"
                    class="btn agregar-btn"
                    :disabled="
                        guardando ||
                        cargando ||
                        !jugadorSeleccionado
                    "
                >
                    {{ guardando ? 'Agregando...' : '+ Agregar al roster' }}
                </button>
            </form>
            <p
                v-if="!cargando && disponibles.length === 0"
                class="descripcion"
            >
                No hay jugadores disponibles para asignar.
            </p>
        </div>
        <p v-if="error" class="error" role="alert">
            {{ error }}
        </p>
        <p v-if="mensaje" class="exito" role="status">
            {{ mensaje }}
        </p>
    </section>
</template>

<style scoped>
.integrantes {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid #78613b;
    color: #f5f3ed;
}

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

h3 {
    margin: 0;
    font-size: 18px;
    color: #f0c86d;
}

.encabezado p,
.descripcion {
    color: #d2ccc0;
    font-size: 13px;
    margin: 6px 0 12px;
}

.tabla-scroll {
    max-height: 250px;
    overflow-y: auto;
    overflow-x: auto;
    border: 1px solid #78613b;
    border-radius: 8px;
    background: #383838;
}

table {
    width: 100%;
    min-width: 650px;
    border-collapse: collapse;
    color: #f5f3ed;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #625744;
    font-size: 14px;
}

th {
    position: sticky;
    top: 0;
    background: #2d2d2d;
    color: #f0c86d;
    font-weight: 600;
    z-index: 1;
}

tbody tr:nth-child(even) td {
    background: #414141;
}

tbody tr:hover td {
    background: #544932;
}

.rol {
    display: inline-block;
    border-radius: 5px;
    padding: 5px 9px;
    font-size: 12px;
    font-weight: 600;
    background: #5d5d5d;
    color: #ffffff;
}

.rol.Titular {
    background: #695126;
    color: #ffe2a1;
    border: 1px solid #a98540;
}

.rol.Suplente {
    background: #565656;
    color: #e9e9e9;
    border: 1px solid #888888;
}

.agregar {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #625744;
}

.campos {
    display: grid;
    grid-template-columns: 1fr 160px;
    gap: 12px;
    margin-top: 16px;
}

.campo {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.campo label {
    font-weight: 600;
    font-size: 13px;
    color: #f0c86d;
}

.campo select,
.rol-selector {
    padding: 11px;
    border: 1px solid #837356;
    border-radius: 7px;
    background: #333333;
    color: #ffffff;
    color-scheme: dark;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
}

.rol-selector {
    font-size: 13px;
    cursor: pointer;
    padding: 8px 10px;
    min-width: 105px;
}

.campo select:focus,
.rol-selector:focus {
    outline: 2px solid #e2b85a;
    outline-offset: 1px;
    border-color: #e2b85a;
}

.btn {
    padding: 9px 13px;
    border: 1px solid transparent;
    border-radius: 7px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: background-color 0.15s;
}

.btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.btn:focus-visible {
    outline: 2px solid #f0c86d;
    outline-offset: 2px;
}

.secundario {
    background: #626262;
    color: #ffffff;
    border-color: #858585;
}

.secundario:hover:not(:disabled) {
    background: #747474;
}

.quitar {
    background: #673434;
    color: #ffdad7;
    border-color: #a75a5a;
}

.quitar:hover:not(:disabled) {
    background: #833d3d;
}

.agregar-btn {
    background: #c79b3b;
    color: #212121;
    margin-top: 14px;
}

.agregar-btn:hover:not(:disabled) {
    background: #e2b85a;
}

.guardar-rol {
    background: #695126;
    color: #ffe2a1;
    border-color: #a98540;
}

.guardar-rol:hover:not(:disabled) {
    background: #83642d;
}

.guardar-rol:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.acciones-fila {
    display: flex;
    align-items: center;
    gap: 8px;
}

.vacio {
    text-align: center;
    color: #d2ccc0;
}

.error,
.exito {
    padding: 11px;
    border-radius: 7px;
    font-size: 13px;
    margin-top: 15px;
}

.error {
    background: #4d2b2b;
    color: #ffb4af;
    border: 1px solid #a75a5a;
}

.exito {
    background: #264234;
    color: #b8ebc7;
    border: 1px solid #4a8862;
}

@media (max-width: 600px) {
    .campos {
        grid-template-columns: 1fr;
    }
}
</style>
