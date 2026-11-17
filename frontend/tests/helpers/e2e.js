import { test as base, expect } from '@playwright/test';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Node.js 24: el mismo archivo de credenciales que ya utiliza auth.spec.js.
loadEnvFile(fileURLToPath(new URL('../../.env.e2e', import.meta.url)));

export const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:5173';
export const API = process.env.E2E_API_URL || 'http://localhost:3000/api';
export const ALLOW_WRITES = process.env.E2E_ALLOW_WRITES === 'true';
export const authFile = (role) => fileURLToPath(new URL(`../../playwright/.auth/${role}.json`, import.meta.url));

const credentials = {
  admin: {
    correo: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD
  },
  public: {
    correo: process.env.E2E_PUBLIC_EMAIL,
    password: process.env.E2E_PUBLIC_PASSWORD
  }
};

function credentialsFor(role) {
  const account = credentials[role];
  if (!account?.correo || !account?.password) {
    throw new Error(`Faltan E2E_${role.toUpperCase()}_EMAIL / E2E_${role.toUpperCase()}_PASSWORD en frontend/.env.e2e`);
  }
  return account;
}

// Reutiliza una sesión JWT real creada por global-setup. Así no se agota
// el límite de 10 intentos de login/15 minutos configurado en Express.
// El flujo de escribir correo/contraseña ya lo cubre auth.spec.js.
export async function signIn(page, role = 'admin') {
  const state = JSON.parse(readFileSync(authFile(role), 'utf8'));
  await page.context().addCookies(state.cookies);
  await page.goto(FRONTEND);
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  const r = await page.context().request.get(`${API}/auth/me`);
  expect(r.status(), `No se pudo confirmar el rol ${role}`).toBe(200);
  const data = await r.json();
  expect(data.usuario.rol).toBe(role === 'admin' ? 'admin' : 'usuario');
}

// Selecciona la tabla correcta, no las filas del modal de integrantes.
export function tableFor(page, title) {
  return page.locator('section.prevista').filter({
    has: page.getByRole('heading', { name: title, exact: true })
  });
}

export function rowFor(page, title, text) {
  return tableFor(page, title).locator('tbody tr').filter({ hasText: text });
}

export async function openDetail(page, title, text) {
  const row = rowFor(page, title, text);
  await expect(row).toBeVisible();
  await row.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

// Estas solicitudes usan la cookie JWT/CSRF real del backend, no mocks.
export async function csrfFrom(context) {
  const state = await context.storageState();
  const cookie = state.cookies.find(c => c.name === 'csrf_token');
  if (!cookie) throw new Error('No se recibió cookie csrf_token tras el login local.');
  return decodeURIComponent(cookie.value);
}

export async function writeApi(context, method, path, data) {
  const csrf = await csrfFrom(context);
  return context.fetch(`${API}${path}`, {
    method,
    headers: { 'X-CSRF-Token': csrf },
    ...(data === undefined ? {} : { data })
  });
}

async function mustSucceed(response, expectedStatus, description) {
  if (response.status() !== expectedStatus) {
    const body = await response.text();
    throw new Error(`${description}: HTTP ${response.status()} (esperado ${expectedStatus}). ${body}`);
  }
  return response.status() === 204 ? null : response.json();
}

// API con credenciales propias. El Origin es necesario en /auth/login.
export async function newAuthenticatedContext(playwright, role = 'admin') {
  // No realiza otro login: utiliza la sesión creada por global-setup.
  return playwright.request.newContext({
    storageState: authFile(role),
    extraHTTPHeaders: { Origin: FRONTEND }
  });
}

class Records {
  constructor(context) {
    this.context = context;
    this.tag = randomUUID().replaceAll('-', '').slice(0, 10);
    this.players = new Set();
    this.rosters = new Set();
  }

  playerName(suffix = 'jugador') {
    return `E2E_${this.tag}_${suffix}`;
  }

  rosterName(suffix = 'roster') {
    return `E2E_${this.tag}_${suffix}`;
  }

  trackPlayerName(name) { this.players.add(name); }
  trackRosterName(name) { this.rosters.add(name); }

  async createPlayer(overrides = {}) {
    const nickname = overrides.nickname ?? this.playerName(`jugador${this.players.size + 1}`);
    this.trackPlayerName(nickname);
    const body = {
      nickname,
      nombre_real: 'Jugador Automatizado',
      pais: 'México',
      rol: 'Top',
      estado: 'activo',
      ...overrides
    };
    const r = await writeApi(this.context, 'POST', '/jugadores', body);
    const data = await mustSucceed(r, 201, 'Crear jugador de prueba');
    return data.jugador;
  }

  async createRoster(overrides = {}) {
    const nombre = overrides.nombre ?? this.rosterName(`roster${this.rosters.size + 1}`);
    this.trackRosterName(nombre);
    const body = {
      nombre,
      juego: 'League Of Legends',
      tipo: 'Academia',
      temporada: '2026',
      ...overrides
    };
    const r = await writeApi(this.context, 'POST', '/rosters', body);
    const data = await mustSucceed(r, 201, 'Crear roster de prueba');
    return data.roster;
  }

  async assign(roster, player, rol = 'Suplente') {
    const r = await writeApi(this.context, 'POST', `/rosters/${roster.id}/jugadores`, {
      id_jugador: player.id,
      rol_en_roster: rol
    });
    const data = await mustSucceed(r, 201, 'Asignar jugador de prueba');
    return data.asignacion;
  }

  async getAll(path, key) {
    const r = await this.context.get(`${API}${path}`);
    const data = await mustSucceed(r, 200, `Leer ${path}`);
    return data[key];
  }

  // Limpieza conservadora: SOLO nombres E2E que este test registró.
  // Primero quita relaciones; después jugadores y finalmente rosters.
  async cleanup() {
    const players = (await this.getAll('/jugadores', 'jugadores'))
      .filter(p => this.players.has(p.nickname));
    const rosters = (await this.getAll('/rosters', 'rosters'))
      .filter(r => this.rosters.has(r.nombre));

    // Incluye las relaciones del roster creado o de nuestros jugadores.
    const allRosters = await this.getAll('/rosters', 'rosters');
    for (const roster of allRosters) {
      if (!this.rosters.has(roster.nombre) && players.length === 0) continue;
      const response = await this.context.get(`${API}/rosters/${roster.id}/jugadores`);
      if (!response.ok()) continue;
      const { jugadores = [] } = await response.json();
      for (const a of jugadores) {
        if (this.rosters.has(roster.nombre) || players.some(p => p.id === a.id_jugador)) {
          const result = await writeApi(this.context, 'DELETE', `/rosters/${roster.id}/jugadores/${a.id_jugador}`);
          if (![204, 404].includes(result.status())) {
            console.warn(`No pude quitar asignación E2E ${roster.id}/${a.id_jugador}: ${result.status()}`);
          }
        }
      }
    }

    for (const player of players) {
      const r = await writeApi(this.context, 'DELETE', `/jugadores/${player.id}`);
      if (![204, 404, 200].includes(r.status())) console.warn(`No pude borrar jugador E2E ${player.id}: ${r.status()}`);
    }
    for (const roster of rosters) {
      const r = await writeApi(this.context, 'DELETE', `/rosters/${roster.id}`);
      if (![204, 404, 200].includes(r.status())) console.warn(`No pude borrar roster E2E ${roster.id}: ${r.status()}`);
    }
  }
}

export const test = base.extend({
  adminApi: async ({ playwright }, use) => {
    const context = await newAuthenticatedContext(playwright, 'admin');
    try { await use(context); }
    finally { await context.dispose(); }
  },
  records: async ({ adminApi }, use) => {
    const records = new Records(adminApi);
    try { await use(records); }
    finally { await records.cleanup(); }
  }
});

export { expect };

export const ISOLATED_DB_MESSAGE =
  'Los tests que escriben se ejecutan solo con E2E_ALLOW_WRITES=true y la API conectada a rosters_e2e. Consulta README.';
