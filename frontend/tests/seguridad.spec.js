import {
  test, expect, API, FRONTEND, ALLOW_WRITES, ISOLATED_DB_MESSAGE,
  newAuthenticatedContext, csrfFrom, writeApi
} from './helpers/e2e.js';

const jugadorFalso = {
  nickname: 'NO_DEBE_CREARSE_E2E', nombre_real: 'Bloqueado',
  pais: 'México', rol: 'Mid', estado: 'activo'
};

test('Public: GET de jugadores y rosters nuevos y anteriores sin JWT responde 200', async ({ request }) => {
  for (const path of ['/public/jugadores', '/public/rosters', '/jugadores', '/rosters']) {
    const r = await request.get(`${API}${path}`);
    expect(r.status(), `GET anónimo ${path}`).toBe(200);
  }
});

test('Public: las rutas públicas no tienen POST, PUT ni DELETE', async ({ request }) => {
  const rutas = [
    { method: 'POST', path: '/public/jugadores' },
    { method: 'PUT', path: '/public/jugadores/999999' },
    { method: 'DELETE', path: '/public/jugadores/999999' },
    { method: 'POST', path: '/public/rosters' },
    { method: 'PUT', path: '/public/rosters/999999' },
    { method: 'DELETE', path: '/public/rosters/999999' },
    { method: 'POST', path: '/public/rosters/999999/jugadores' },
    { method: 'PUT', path: '/public/rosters/999999/jugadores/999999' },
    { method: 'DELETE', path: '/public/rosters/999999/jugadores/999999' }
  ];
  for (const { method, path } of rutas) {
    const r = await request.fetch(`${API}${path}`, {
      method,
      ...(method === 'DELETE' ? {} : { data: jugadorFalso })
    });
    expect(r.status(), `${method} ${path} no debe existir`).toBe(404);
  }
});

test('Admin: sin JWT no se permiten escrituras nuevas ni antiguas', async ({ request }) => {
  const rutas = [
    { method: 'POST', path: '/admin/jugadores' },
    { method: 'PUT', path: '/admin/jugadores/999999' },
    { method: 'DELETE', path: '/admin/jugadores/999999' },
    { method: 'POST', path: '/admin/rosters' },
    { method: 'PUT', path: '/admin/rosters/999999' },
    { method: 'DELETE', path: '/admin/rosters/999999' },
    { method: 'POST', path: '/admin/rosters/999999/jugadores' },
    { method: 'PUT', path: '/admin/rosters/999999/jugadores/999999' },
    { method: 'DELETE', path: '/admin/rosters/999999/jugadores/999999' },
    { method: 'POST', path: '/jugadores' },
    { method: 'POST', path: '/rosters' },
    { method: 'POST', path: '/rosters/999999/jugadores' }
  ];
  for (const { method, path } of rutas) {
    const r = await request.fetch(`${API}${path}`, {
      method,
      ...(method === 'DELETE' ? {} : { data: jugadorFalso })
    });
    expect(r.status(), `${method} ${path} sin JWT`).toBe(401);
  }
});

test('Admin: jugadores disponibles exige JWT (incluido alias anterior)', async ({ request }) => {
  for (const path of ['/admin/jugadores/disponibles', '/jugadores/disponibles']) {
    const r = await request.get(`${API}${path}`);
    expect(r.status(), path).toBe(401);
  }
});

test('JWT: Admin auténtico tiene cookies HttpOnly y CSRF y rol correcto', async ({ playwright }) => {
  const context = await newAuthenticatedContext(playwright);
  try {
    const state = await context.storageState();
    const jwt = state.cookies.find(c => c.name === 'auth_token');
    const csrf = state.cookies.find(c => c.name === 'csrf_token');
    expect(jwt).toBeTruthy();
    expect(jwt.httpOnly).toBe(true);
    expect(csrf).toBeTruthy();
    expect(csrf.httpOnly).toBe(false);
    const r = await context.get(`${API}/auth/me`);
    expect(r.status()).toBe(200);
    expect((await r.json()).usuario.rol).toBe('admin');
  } finally {
    await context.dispose();
  }
});

test('CSRF: Admin sin X-CSRF-Token recibe 403 en nueva ruta', async ({ playwright }) => {
  const context = await newAuthenticatedContext(playwright);
  try {
    const r = await context.post(`${API}/admin/jugadores`, { data: jugadorFalso });
    expect(r.status()).toBe(403);
    expect(JSON.stringify(await r.json())).toMatch(/CSRF/i);
  } finally {
    await context.dispose();
  }
});

test('CSRF: Admin con token incorrecto recibe 403', async ({ playwright }) => {
  const context = await newAuthenticatedContext(playwright);
  try {
    const r = await context.post(`${API}/admin/jugadores`, {
      headers: { 'X-CSRF-Token': 'incorrecto' }, data: jugadorFalso
    });
    expect(r.status()).toBe(403);
  } finally {
    await context.dispose();
  }
});

test('CSRF: token de la cookie tiene formato válido', async ({ playwright }) => {
  const context = await newAuthenticatedContext(playwright);
  try {
    const token = await csrfFrom(context);
    expect(token).toMatch(/^[a-f0-9]{64}\.[a-f0-9]{64}$/);
  } finally {
    await context.dispose();
  }
});

test('Admin puede crear en la URL nueva usando JWT y CSRF válidos', async ({ adminApi, records }) => {
  test.skip(!ALLOW_WRITES, ISOLATED_DB_MESSAGE);
  const nickname = records.playerName('csrf');
  records.trackPlayerName(nickname);
  const r = await writeApi(adminApi, 'POST', '/admin/jugadores', {
    ...jugadorFalso, nickname
  });
  expect(r.status()).toBe(201);
});

test('Public: los detalles e integrantes se consultan por rutas nuevas sin JWT', async ({ request, records }) => {
  test.skip(!ALLOW_WRITES, ISOLATED_DB_MESSAGE);
  const jugador = await records.createPlayer();
  const roster = await records.createRoster();
  await records.assign(roster, jugador);
  for (const path of [
    `/public/jugadores/${jugador.id}`,
    `/public/rosters/${roster.id}`,
    `/public/rosters/${roster.id}/jugadores`
  ]) {
    const r = await request.get(`${API}${path}`);
    expect(r.status(), `GET ${path}`).toBe(200);
  }
});

test('Admin: ni siquiera con JWT puede escribir por URL Public', async ({ adminApi }) => {
  const r = await writeApi(adminApi, 'POST', '/public/jugadores', jugadorFalso);
  expect(r.status()).toBe(404);
});

test('Login local: un Origin no autorizado se rechaza', async ({ request }) => {
  const r = await request.post(`${API}/auth/login`, {
    headers: { Origin: 'http://sitio-no-autorizado.invalid' },
    data: { correo: 'invalido@example.com', password: 'invalida' }
  });
  expect(r.status()).toBe(403);
});
