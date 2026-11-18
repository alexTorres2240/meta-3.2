import { test, expect, FRONTEND, API, tableFor } from './helpers/e2e.js';

const correo = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

async function abrirLogin(page) {
  await page.goto(FRONTEND);
  await expect(tableFor(page, 'Jugadores')).toBeVisible();
  await expect(tableFor(page, 'Rosters')).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.locator('input[type="email"]')).toBeVisible();
}

async function loginReal(page) {
  await abrirLogin(page);
  await page.locator('input[type="email"]').fill(correo);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
}

test('La página abre en modo Public sin login ni controles Admin', async ({ page }) => {
  await page.goto(FRONTEND);
  await expect(tableFor(page, 'Jugadores')).toBeVisible();
  await expect(tableFor(page, 'Rosters')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Nuevo jugador/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Nuevo roster/i })).toHaveCount(0);
});

test('El botón Iniciar sesión abre el formulario y Volver al catálogo regresa a Public', async ({ page }) => {
  await abrirLogin(page);
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await page.getByRole('button', { name: 'Volver al catálogo' }).click();
  await expect(tableFor(page, 'Jugadores')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
});

test('Admin inicia sesión con credenciales reales y habilita edición', async ({ page }) => {
  await loginReal(page);
  await expect(page.getByRole('button', { name: /Nuevo jugador/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Nuevo roster/i })).toBeVisible();
  const r = await page.context().request.get(`${API}/auth/me`);
  expect(r.status()).toBe(200);
  expect((await r.json()).usuario.rol).toBe('admin');
});

test('Contraseña incorrecta impide iniciar sesión', async ({ page }) => {
  await abrirLogin(page);
  await page.locator('input[type="email"]').fill(correo);
  await page.locator('input[type="password"]').fill('contrasena-incorrecta-e2e');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('alert')).toContainText(/credenciales|incorrect|no autorizado/i);
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toHaveCount(0);
  const r = await page.context().request.get(`${API}/auth/me`);
  expect(r.status()).toBe(401);
});

test('Cerrar sesión de Admin regresa al catálogo Public y revoca la sesión', async ({ page }) => {
  await loginReal(page);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(tableFor(page, 'Jugadores')).toBeVisible();
  await expect(tableFor(page, 'Rosters')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Nuevo jugador/i })).toHaveCount(0);
  const r = await page.context().request.get(`${API}/auth/me`);
  expect(r.status()).toBe(401);
});
