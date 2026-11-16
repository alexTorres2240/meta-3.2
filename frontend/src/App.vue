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
  try {
    const respuesta = await api('/auth/me');
    if (respuesta.usuario.rol !== 'admin') {
      throw new Error('Acceso exclusivo para administradores');
    }
  } catch (err) {
    usuario.value = null;
    if (err.status !== 401) {
      error.value = err.message;
    }
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
    if (respuesta.usuario.rol !== 'admin') {
      await api('/auth/logout', { method: 'POST' });
      throw new Error('No tienes permisos de administrador');
    }
    usuario.value = respuesta.usuario;
    password.value = '';
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
    jugadores.value = [];
    rosters.value = [];
    correo.value = '';
    password.value = '';
  } catch (err) {
    error.value = err.message;
  }
}

onMounted(verificarSesion);
</script>

<template>
  <main class="contenedor">
    <div v-if="cargando" class="tarjeta">
      Comprobando sesión...
    </div>
    <section v-else-if="!usuario" class="tarjeta login">
      <h1>Rosters Admin</h1>
      <p>Panel de administración</p>
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
          {{ procesando ? "Ingresando..." : "Iniciar sesión" }}
        </button>
       </form>
    </section>
    <section v-else>
      <header class="cabecera">
        <div>
          <h1>Panel de administración</h1>
          <p>Bienvenido, {{  usuario.nombre }}</p>
        </div>
        <button class="salir" @click="cerrarSesion">
          Cerrar sesión
        </button>
      </header>
      <PanelPrevistas
          :jugadores="jugadores"
          :rosters="rosters"
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
          v-if="tipoCrear"
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
  max-width: 1100px;
  margin: 50px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.tarjeta {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 3px 15px #00000014;
  margin-bottom: 25px;
}

.login {
  max-width: 400px;
  margin: 80px auto;
}

label {
  display: block;
  margin-top: 20px;
  margin-bottom: 8px;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 7px;
}

button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 7px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  margin-top: 25px;
}

.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.salir {
  background: #dc2626
}

.estadisticas {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.error {
  color: #b91c1c;
  text-align: center;
}

@media (max-width: 650px) {
  .cabecera {
    flex-direction: column;
    align-items: start;
  }

  .estadisticas {
    grid-template-columns: 1fr;
  }

  .tarjeta {
    overflow-x: auto;
  }
}
</style>