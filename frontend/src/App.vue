<script setup>
import { ref, onMounted } from 'vue';
import { api } from './services/api.js';
import PanelPrevistas from './components/PanelPrevistas.vue';
import Crear from './components/Crear.vue';
import Detalle from './components/Detalle.vue';

const correo = ref('');
const password = ref('');

const usuario = ref(null);
const jugadores = ref([]);
const rosters = ref([]);

const cargando = ref(true);
const procesando = ref(false);
const error = ref('');

const tipoCrear = ref(null);
const detalle = ref(null);
const mostrandoLogin = ref(false);

async function cargarDatos() {
  const [datosJugadores, datosRosters] = await Promise.all([
    api('/jugadores'),
    api('/rosters')
  ]);
  jugadores.value = datosJugadores.jugadores;
  rosters.value = datosRosters.rosters;
}

async function actualizarVista() {
    try {
        error.value = '';
        await cargarDatos();
    } catch (err) {
        error.value = err.message;
    }
}

function abrirCrear(tipo) {
    tipoCrear.value = tipo;
}

function cerrarCrear() {
    tipoCrear.value = null;
}

function abrirDetalle(tipo, registro) {
    detalle.value = {
        tipo,
        registro
    };
}

function cerrarDetalle() {
    detalle.value = null;
}

async function detalleModificado() {
    cerrarDetalle();
    await actualizarVista();
}

async function registroCreado(resultado) {
    console.log('Registro creado:', resultado);
    cerrarCrear();
    await actualizarVista();
}

function accionPendiente(accion, id = null) {
    console.log('Acción:', accion, 'Registro:', id);
}

async function verificarSesion() {
    error.value = '';
    try {
        try {
            const respuesta = await api('/auth/me');

            usuario.value =
                respuesta.usuario?.rol === 'admin'
                    ? respuesta.usuario
                    : null;
        } catch (err) {
            usuario.value = null;
            if (err.status !== 401) {
                error.value = err.message;
            }
        }
        await cargarDatos();
    } catch (err) {
        error.value = err.message;
    } finally {
        cargando.value = false;
    }
}


async function iniciarSesion() {
    error.value = '';
    procesando.value = true;
    try {
        const respuesta = await api('/auth/login', {
            method: 'POST',
            body: {
                correo: correo.value,
                password: password.value
            }
        });
        if (respuesta.usuario?.rol !== 'admin') {
            try {
                await api('/auth/logout', {
                    method: 'POST'
                });
            } catch {
            }
            throw new Error(
                'Acceso exclusivo para administradores'
            );
        }
        usuario.value = respuesta.usuario;
        mostrandoLogin.value = false;
        password.value = '';
        tipoCrear.value = null;
        detalle.value = null;
        await cargarDatos();
    } catch (err) {
        error.value = err.message;
    } finally {
        procesando.value = false;
    }
}


async function cerrarSesion() {
    error.value = '';
    try {
        await api('/auth/logout', {
            method: 'POST'
        });
        usuario.value = null;
        mostrandoLogin.value = false;
        tipoCrear.value = null;
        detalle.value = null;
        correo.value = '';
        password.value = '';
        await cargarDatos();
    } catch (err) {
        error.value = err.message;
    }
}

function abrirLogin() {
    error.value = '';
    mostrandoLogin.value = true;
}

function volverAlCatalogo() {
    error.value = '';
    mostrandoLogin.value = false;
    correo.value = '';
    password.value = '';
}


onMounted(verificarSesion);
</script>


<template>
  <main class="contenedor">
    <div v-if="cargando" class="tarjeta">
      Cargando registros...
    </div>
    <section
      v-else-if="mostrandoLogin && !usuario"
      class="tarjeta login"
    >
      <h1>ES Rosters Database</h1>
      <form @submit.prevent="iniciarSesion">
        <label>Correo electrónico</label>
        <input
          v-model="correo"
          type="email"
          required
          autocomplete="username"
          placeholder="admin@ejemplo.com"
        />
        <label>Contraseña</label>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          placeholder="Contraseña"
        />
        <button :disabled="procesando">
          {{ procesando ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>
      <button type="button" @click="volverAlCatalogo">
        Volver al catálogo
      </button>
    </section>
    <section v-else>
      <header class="cabecera">
        <div>
          <h1>
            {{
              usuario?.rol === 'admin'
                ? 'Panel de administración'
                : 'ES Rosters Database'
            }}
          </h1>
          <p v-if="usuario?.rol === 'admin'">
            Bienvenido, {{ usuario.nombre }}
          </p>
          <p v-else>
            Consulta pública de jugadores y rosters
          </p>
        </div>
        <button
          v-if="usuario?.rol === 'admin'"
          class="salir"
          @click="cerrarSesion"
        >
          Cerrar sesión
        </button>
        <button
          v-else
          type="button"
          @click="abrirLogin"
        >
          Iniciar sesión
        </button>
      </header>
      <PanelPrevistas
        :jugadores="jugadores"
        :rosters="rosters"
        :es-admin="usuario?.rol === 'admin'"
        @actualizar="actualizarVista"
        @nuevo-jugador="abrirCrear('jugador')"
        @nuevo-roster="abrirCrear('roster')"
        @seleccionar-jugador="
          registro => abrirDetalle('jugador', registro)
        "
        @seleccionar-roster="
          registro => abrirDetalle('roster', registro)
        "
      />
      <Crear
        v-if="usuario?.rol === 'admin' && tipoCrear"
        :key="tipoCrear"
        :tipo="tipoCrear"
        @cerrar="cerrarCrear"
        @creado="registroCreado"
      />
      <Detalle
        v-if="detalle"
        :key="`${detalle.tipo}-${detalle.registro.id}`"
        :tipo="detalle.tipo"
        :registro="detalle.registro"
        :es-admin="usuario?.rol === 'admin'"
        @cerrar="cerrarDetalle"
        @actualizado="detalleModificado"
        @eliminado="detalleModificado"
        @asignaciones-cambiadas="actualizarVista"
      />
    </section>
    <p v-if="error" class="error" role="alert">
      {{ error }}
    </p>
  </main>
</template>


<style scoped>
.contenedor {
  min-height: 100vh;
  box-sizing: border-box;
  margin: 0;
  padding: 24px;
  background: #212121;
  color: #f5f3ed;
  font-family: Arial, sans-serif;
}

h1 {
  margin-top: 0;
  color: #f0c86d;
}

p {
  color: #d2ccc0;
}

.tarjeta {
  padding: 28px;
  margin-bottom: 25px;
  background: #4b4b4b;
  color: #f5f3ed;
  border: 1px solid #665944;
  border-radius: 12px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.24);
}

.login {
  max-width: 400px;
  margin: 80px auto;
}

.login h1 {
  color: #f0c86d;
  margin-bottom: 24px;
}

label {
  display: block;
  margin-top: 20px;
  margin-bottom: 8px;
  color: #f0c86d;
  font-weight: 600;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  border: 1px solid #837356;
  border-radius: 7px;
  background: #333333;
  color: #ffffff;
  font-size: 15px;
  color-scheme: dark;
}

input::placeholder {
  color: #bdb6a8;
  opacity: 1;
}

input:focus {
  outline: 2px solid #e2b85a;
  outline-offset: 1px;
  border-color: #e2b85a;
}

button {
  margin-top: 20px;
  padding: 12px 20px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: #c79b3b;
  color: #212121;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
}

button:hover:not(:disabled) {
  background: #e2b85a;
}

button:focus-visible {
  outline: 2px solid #f0c86d;
  outline-offset: 3px;
}

button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 24px 28px;
  background: #4b4b4b;
  border: 1px solid #665944;
  border-radius: 12px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.24);
}

.cabecera h1 {
  margin: 0 0 8px;
  color: #f0c86d;
}

.cabecera p {
  margin: 0;
  color: #d2ccc0;
}

.salir {
  margin-top: 0;
  background: #803b3b;
  color: #ffffff;
  border-color: #bd6868;
}

.salir:hover:not(:disabled) {
  background: #994545;
}

.estadisticas {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  color: #f5f3ed;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #625744;
}

th {
  background: #2d2d2d;
  color: #f0c86d;
}

.error {
  padding: 12px;
  border: 1px solid #a75a5a;
  border-radius: 7px;
  background: #4d2b2b;
  color: #ffb4af;
  text-align: center;
}

@media (max-width: 650px) {
  .contenedor {
    padding: 16px;
  }

  .login {
    margin: 40px auto;
  }

  .cabecera {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .estadisticas {
    grid-template-columns: 1fr;
  }

  .tarjeta {
    overflow-x: auto;
  }
}
</style>
