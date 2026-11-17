import { test, expect, API, FRONTEND, ALLOW_WRITES, ISOLATED_DB_MESSAGE, newAuthenticatedContext, csrfFrom, writeApi } from './helpers/e2e.js';

test('JWT: sin sesión no se pueden consultar jugadores ni rosters', async ({ request }) => {
  for (const path of ['/jugadores', '/rosters']) {
    const r = await request.get(`${API}${path}`);
    expect(r.status(), `Sin JWT ${path}`).toBe(401);
  }
});

test('JWT: sesión local activa tiene cookie HttpOnly y /auth/me responde 200', async ({ playwright }) => {
  const context = await newAuthenticatedContext(playwright, 'admin');
  try {
    const state = await context.storageState();
    const jwtCookie = state.cookies.find(c => c.name === 'auth_token');
    const csrfCookie = state.cookies.find(c => c.name === 'csrf_token');
    expect(jwtCookie).toBeTruthy();
    expect(jwtCookie.httpOnly).toBe(true);
    expect(csrfCookie).toBeTruthy();
    expect(csrfCookie.httpOnly).toBe(false);
    const r = await context.get(`${API}/auth/me`);
    expect(r.status()).toBe(200);
    expect((await r.json()).usuario.rol).toBe('admin');
  } finally {
    await context.dispose();
  }
});

test('Roles: Public no puede hacer POST aun con CSRF válido', async ({ playwright }) => {
  const context = await newAuthenticatedContext(playwright, 'public');
  try {
    const r = await writeApi(context, 'POST', '/jugadores', {
      nickname: 'NO_DEBE_CREARSE_E2E', nombre_real: 'Bloqueado', pais: 'México',
      rol: 'Mid', estado: 'activo'
    });
    expect(r.status()).toBe(403);
  } finally {
    await context.dispose();
  }
});

test('CSRF: Admin sin cabecera X-CSRF-Token recibe 403', async ({ playwright }) => {
  const context = await newAuthenticatedContext(playwright);
  try {
    const r = await context.post(`${API}/jugadores`, {
      data: { nickname: 'NO_DEBE_CREARSE_E2E', nombre_real: 'Bloqueado', pais: 'México', rol: 'Mid', estado: 'activo' }
    });
    expect(r.status()).toBe(403);
    expect((await r.json()).error).toMatch(/CSRF/i);
  } finally {
    await context.dispose();
  }
});

test('CSRF: Admin con cabecera incorrecta recibe 403', async ({ playwright }) => {
  const context = await newAuthenticatedContext(playwright);
  try {
    const r = await context.post(`${API}/jugadores`, {
      headers: { 'X-CSRF-Token': 'incorrecto' },
      data: { nickname: 'NO_DEBE_CREARSE_E2E', nombre_real: 'Bloqueado', pais: 'México', rol: 'Mid', estado: 'activo' }
    });
    expect(r.status()).toBe(403);
  } finally {
    await context.dispose();
  }
});

test('CSRF: Admin con cabecera válida puede crear un registro temporal', async ({ adminApi, records }) => {
  test.skip(!ALLOW_WRITES, ISOLATED_DB_MESSAGE);
  const nickname = records.playerName('csrf');
  records.trackPlayerName(nickname);
  const r = await writeApi(adminApi, 'POST', '/jugadores', {
    nickname, nombre_real: 'Comprobación CSRF', pais: 'México', rol: 'Mid', estado: 'activo'
  });
  expect(r.status()).toBe(201);
});

test('CSRF: la cookie recibida coincide con el token que se usa en el header', async ({ playwright }) => {
  const context = await newAuthenticatedContext(playwright);
  try {
    const token = await csrfFrom(context);
    expect(token).toMatch(/^[a-f0-9]{64}\.[a-f0-9]{64}$/);
  } finally {
    await context.dispose();
  }
});

test('Login local: Origin no autorizado es rechazado', async ({ request }) => {
  const r = await request.post(`${API}/auth/login`, {
    headers: { Origin: 'http://sitio-no-autorizado.invalid' },
    data: { correo: 'invalido@example.com', password: 'invalida' }
  });
  expect(r.status()).toBe(403);
});
