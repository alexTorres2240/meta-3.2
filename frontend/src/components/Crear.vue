
<script setup>
import { reactive, ref, onMounted } from 'vue';
import { api } from '../services/api.js';

const props = defineProps({
    tipo: {
        type: String,
        required: true,
        validator: valor => ['jugador', 'roster'].includes(valor)
    }
});

const emit = defineEmits(['cerrar', 'creado']);

const guardando = ref(false);
const error = ref('');
const primerCampo = ref(null);

const jugador = reactive({
    nickname: '',
    nombre_real: '',
    pais: '',
    rol: '',
    estado: 'activo'
});

const roster = reactive({
    nombre: '',
    juego: 'League Of Legends',
    tipo: '',
    temporada: ''
});

function cerrar() {
    if (!guardando.value) {
        emit('cerrar');
    }
}

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
        if (Object.values(datos).some(
            valor => !String(valor).trim()
        )) {
            throw new Error('Todos los campos son obligatorios.');
        }
        const respuesta = await api(ruta, {
            method: 'POST',
            body: datos
        });
        if (!respuesta?.success) {
            throw new Error('La API no confirmó el registro.');
        }
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
                <p v-if="error" class="error" role="alert">
                    {{ error }}
                </p>
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
    background: rgba(0, 0, 0, 0.78);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow-y: auto;
}

.modal {
    width: 100%;
    max-width: 480px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    box-sizing: border-box;
    padding: 28px;
    border-radius: 14px;
    border: 1px solid #78613b;
    background: #4b4b4b;
    color: #f5f3ed;
    font-family: Arial, sans-serif;
    box-shadow: 0 18px 55px rgba(0, 0, 0, 0.55);
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
    color: #f0c86d;
}

.encabezado p {
    margin: 8px 0 0;
    color: #d2ccc0;
    font-size: 14px;
}

.cerrar {
    background: transparent;
    color: #e5c071;
    border: none;
    font-size: 28px;
    cursor: pointer;
    padding: 0 4px;
}

.cerrar:hover:not(:disabled) {
    color: #ffffff;
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
    color: #f0c86d;
}

.campo input,
.campo select {
    width: 100%;
    padding: 12px;
    border: 1px solid #837356;
    border-radius: 7px;
    font-size: 15px;
    box-sizing: border-box;
    background: #333333;
    color: #ffffff;
    color-scheme: dark;
}

.campo input::placeholder {
    color: #bdb6a8;
    opacity: 1;
}

.campo input:focus,
.campo select:focus {
    outline: 2px solid #e2b85a;
    outline-offset: 1px;
    border-color: #e2b85a;
}

.botones {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 26px;
}

.btn {
    padding: 11px 20px;
    border: 1px solid transparent;
    border-radius: 7px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.15s, border-color 0.15s;
}

.cancelar {
    background: #626262;
    color: #ffffff;
    border-color: #858585;
}

.cancelar:hover:not(:disabled) {
    background: #747474;
}

.guardar {
    background: #c79b3b;
    color: #212121;
}

.guardar:hover:not(:disabled) {
    background: #e2b85a;
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
</style>
