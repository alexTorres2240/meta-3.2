
<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { api } from '../services/api.js';

const props = defineProps({
    rosterId: {
        type: [Number, String],
        required: true
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

// Consultar integrantes y jugadores disponibles
async function cargarDatos() {
    cargando.value = true;

    try {
        const [respuestaRoster, respuestaDisponibles] =
            await Promise.all([
                api(ruta.value),
                api('/jugadores/disponibles')
            ]);

        integrantes.value = respuestaRoster.jugadores ?? [];
        disponibles.value = respuestaDisponibles.jugadores ?? [];

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

// Agregar un jugador existente
async function agregarJugador() {
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
    if (
        actualizandoId.value !== null ||
        guardando.value ||
        quitandoId.value !== null
    ) {
        return;
    }

    const idJugador = asignacion.id_jugador;
    const nuevoRol = rolesTemporales[idJugador];

    // No enviar solicitudes si el rol no cambió
    if (nuevoRol === asignacion.rol_en_roster) {
        return;
    }

    error.value = '';
    mensaje.value = '';
    actualizandoId.value = idJugador;

    try {
        // Actualizar la asignación mediante Sequelize
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

        // Recargar los integrantes
        await cargarDatos();

        mensaje.value = 'Rol actualizado correctamente.';

        // Notificar al componente padre
        emit('cambiado');

    } catch (err) {
        error.value = err.message ||
            'Error al cambiar el rol del jugador.';
    } finally {
        actualizandoId.value = null;
    }
}


// Quitar al jugador únicamente del roster
async function quitarJugador(asignacion) {
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

        <!-- TABLA SCROLLEABLE -->
        <div class="tabla-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Nickname</th>
                        <th>Posición</th>
                        <th>Rol en roster</th>
                        <th>Acción</th>
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

                        <!-- Rol editable -->
                        <td>
                            <select
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
                        </td>

                        <td>
                            <div class="acciones-fila">

                                <!-- Guardar nuevo rol -->
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

                                <!-- Quitar jugador del roster -->
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
                        <td colspan="4" class="vacio">
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

        <!-- AGREGAR JUGADOR -->
        <div class="agregar">
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
    border-top: 1px solid #e2e8f0;
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
    color: #1e293b;
}

.encabezado p,
.descripcion {
    color: #64748b;
    font-size: 13px;
    margin: 6px 0 12px;
}

/* Tabla con scroll vertical */
.tabla-scroll {
    max-height: 250px;
    overflow-y: auto;
    overflow-x: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

table {
    width: 100%;
    min-width: 530px;
    border-collapse: collapse;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    font-size: 14px;
}

th {
    position: sticky;
    top: 0;
    background: #f1f5f9;
    color: #475569;
    z-index: 1;
}

tr:hover td {
    background: #f8fafc;
}

.rol {
    border-radius: 5px;
    padding: 5px 9px;
    font-size: 12px;
    background: #f1f5f9;
}

.rol.Titular {
    background: #dcfce7;
    color: #166534;
}

.rol.Suplente {
    background: #dbeafe;
    color: #1d4ed8;
}

.agregar {
    margin-top: 24px;
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
}

.campo select {
    padding: 11px;
    border: 1px solid #cbd5e1;
    border-radius: 7px;
    background: white;
    color: #1e293b;
    width: 100%;
    min-width: 0;
}

.btn {
    padding: 9px 13px;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    font-size: 13px;
}

.btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.secundario {
    background: #e2e8f0;
    color: #334155;
}

.quitar {
    background: #fee2e2;
    color: #b91c1c;
}

.agregar-btn {
    background: #2563eb;
    color: white;
    margin-top: 14px;
}

.vacio {
    text-align: center;
    color: #64748b;
}

.error,
.exito {
    padding: 11px;
    border-radius: 7px;
    font-size: 13px;
    margin-top: 15px;
}

.error {
    background: #fef2f2;
    color: #b91c1c;
}

.exito {
    background: #f0fdf4;
    color: #166534;
}

@media (max-width: 600px) {
    .campos {
        grid-template-columns: 1fr;
    }
}

/* Selector de rol de cada integrante */
.rol-selector {
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 7px;
    background: white;
    color: #1e293b;
    font-size: 13px;
    cursor: pointer;
    min-width: 105px;
}

.rol-selector:focus {
    outline: 2px solid #93c5fd;
    border-color: #2563eb;
}

/* Acciones de cada fila */
.acciones-fila {
    display: flex;
    align-items: center;
    gap: 8px;
}

.guardar-rol {
    background: #dbeafe;
    color: #1d4ed8;
}

.guardar-rol:hover:not(:disabled) {
    background: #bfdbfe;
}

.guardar-rol:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* Mantener el desplazamiento horizontal */
.tabla-scroll table {
    min-width: 650px;
}
</style>
