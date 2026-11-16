
<script setup>
import { reactive, ref, onMounted } from 'vue';
import { api } from '../services/api.js';

// Determina si vamos a crear un jugador o un roster
const props = defineProps({
    tipo: {
        type: String,
        required: true,
        validator: valor => ['jugador', 'roster'].includes(valor)
    }
});

// Eventos que recibirá App.vue
const emit = defineEmits(['cerrar', 'creado']);

const guardando = ref(false);
const error = ref('');
const primerCampo = ref(null);

// Datos del formulario de jugadores
const jugador = reactive({
    nickname: '',
    nombre_real: '',
    pais: '',
    rol: '',
    estado: 'activo'
});

// Datos del formulario de rosters
const roster = reactive({
    nombre: '',
    juego: 'League Of Legends',
    tipo: '',
    temporada: ''
});

// Cerrar formulario
function cerrar() {
    if (!guardando.value) {
        emit('cerrar');
    }
}

// Guardar registro en MySQL mediante la API
async function guardar() {
    if (guardando.value) return;

    error.value = '';
    guardando.value = true;

    try {
        let ruta;
        let datos;

        if (props.tipo === 'jugador') {
            ruta = '/jugadores';

            datos = {
                nickname: jugador.nickname.trim(),
                nombre_real: jugador.nombre_real.trim(),
                pais: jugador.pais.trim(),
                rol: jugador.rol,
                estado: jugador.estado
            };

        } else {
            ruta = '/rosters';

            datos = {
                nombre: roster.nombre.trim(),
                juego: roster.juego.trim(),
                tipo: roster.tipo,
                temporada: roster.temporada.trim()
            };
        }

        // Validar campos vacíos
        if (Object.values(datos).some(
            valor => !String(valor).trim()
        )) {
            throw new Error('Todos los campos son obligatorios.');
        }

        // Enviar POST con JWT y CSRF mediante api.js
        const respuesta = await api(ruta, {
            method: 'POST',
            body: datos
        });

        if (!respuesta?.success) {
            throw new Error('La API no confirmó el registro.');
        }

        // Avisar que el registro fue creado
        emit('creado', {
            tipo: props.tipo,
            registro: props.tipo === 'jugador'
                ? respuesta.jugador
                : respuesta.roster
        });

    } catch (err) {
        error.value = err.message || 'Error al guardar el registro.';
    } finally {
        guardando.value = false;
    }
}

// Colocar el cursor en el primer campo
onMounted(() => {
    primerCampo.value?.focus();
});
</script>

<template>
    <div
        class="fondo-modal"
        @click.self="cerrar"
        @keydown.esc="cerrar"
    >
        <section
            class="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-crear"
        >
            <header class="encabezado">
                <div>
                    <h2 id="titulo-crear">
                        Crear {{ tipo === 'jugador' ? 'jugador' : 'roster' }}
                    </h2>
                    <p>Completa la información del nuevo registro.</p>
                </div>

                <button
                    type="button"
                    class="cerrar"
                    aria-label="Cerrar formulario"
                    :disabled="guardando"
                    @click="cerrar"
                >
                    &times;
                </button>
            </header>

            <form @submit.prevent="guardar">
                <!-- FORMULARIO JUGADOR -->
                <template v-if="tipo === 'jugador'">
                    <div class="campo">
                        <label for="nickname">Nickname</label>
                        <input
                            id="nickname"
                            ref="primerCampo"
                            v-model.trim="jugador.nickname"
                            type="text"
                            maxlength="255"
                            placeholder="Ej. Shadow"
                            required
                        />
                    </div>

                    <div class="campo">
                        <label for="nombre_real">Nombre real</label>
                        <input
                            id="nombre_real"
                            v-model.trim="jugador.nombre_real"
                            type="text"
                            maxlength="255"
                            placeholder="Nombre completo"
                            required
                        />
                    </div>

                    <div class="campo">
                        <label for="pais">País</label>
                        <input
                            id="pais"
                            v-model.trim="jugador.pais"
                            type="text"
                            maxlength="255"
                            placeholder="Ej. México"
                            required
                        />
                    </div>

                    <div class="campo">
                        <label for="rol">Posición</label>
                        <select
                            id="rol"
                            v-model="jugador.rol"
                            required
                        >
                            <option value="" disabled>
                                Selecciona una posición
                            </option>
                            <option value="Top">Top</option>
                            <option value="Jungle">Jungle</option>
                            <option value="Mid">Mid</option>
                            <option value="ADC">ADC</option>
                            <option value="Support">Support</option>
                        </select>
                    </div>

                    <div class="campo">
                        <label for="estado">Estado</label>
                        <select
                            id="estado"
                            v-model="jugador.estado"
                            required
                        >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                </template>

                <!-- FORMULARIO ROSTER -->
                <template v-else>
                    <div class="campo">
                        <label for="nombre">Nombre del roster</label>
                        <input
                            id="nombre"
                            ref="primerCampo"
                            v-model.trim="roster.nombre"
                            type="text"
                            maxlength="255"
                            placeholder="Ej. Team Dragons"
                            required
                        />
                    </div>

                    <div class="campo">
                        <label for="juego">Juego</label>
                        <input
                            id="juego"
                            v-model.trim="roster.juego"
                            type="text"
                            maxlength="255"
                            required
                        />
                    </div>

                    <div class="campo">
                        <label for="tipo">Tipo de roster</label>
                        <select
                            id="tipo"
                            v-model="roster.tipo"
                            required
                        >
                            <option value="" disabled>
                                Selecciona un tipo
                            </option>
                            <option value="Principal">Principal</option>
                            <option value="Academia">Academia</option>
                        </select>
                    </div>

                    <div class="campo">
                        <label for="temporada">Temporada</label>
                        <input
                            id="temporada"
                            v-model.trim="roster.temporada"
                            type="text"
                            maxlength="255"
                            placeholder="Ej. 2026"
                            required
                        />
                    </div>
                </template>

                <!-- MENSAJE DE ERROR -->
                <p v-if="error" class="error" role="alert">
                    {{ error }}
                </p>

                <!-- BOTONES -->
                <footer class="botones">
                    <button
                        type="button"
                        class="btn cancelar"
                        :disabled="guardando"
                        @click="cerrar"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        class="btn guardar"
                        :disabled="guardando"
                    >
                        {{ guardando ? 'Guardando...' : 'Guardar' }}
                    </button>
                </footer>
            </form>
        </section>
    </div>
</template>

<style scoped>
.fondo-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow-y: auto;
}

.modal {
    background: white;
    width: 100%;
    max-width: 480px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    padding: 28px;
    border-radius: 14px;
    box-shadow: 0 10px 40px #00000030;
    box-sizing: border-box;
}

.encabezado {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 24px;
}

.encabezado h2 {
    margin: 0;
    font-size: 24px;
}

.encabezado p {
    margin: 8px 0 0;
    color: #64748b;
    font-size: 14px;
}

.cerrar {
    background: transparent;
    color: #64748b;
    border: none;
    font-size: 28px;
    cursor: pointer;
    padding: 0 4px;
}

.campo {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 17px;
}

.campo label {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
}

.campo input,
.campo select {
    width: 100%;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 7px;
    font-size: 15px;
    box-sizing: border-box;
    background: white;
    color: #1e293b;
}

.campo input:focus,
.campo select:focus {
    outline: 2px solid #93c5fd;
    border-color: #2563eb;
}

.botones {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 26px;
}

.btn {
    padding: 11px 20px;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    font-size: 14px;
}

.cancelar {
    background: #e2e8f0;
    color: #334155;
}

.guardar {
    background: #2563eb;
    color: white;
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
</style>
