import { test, expect, FRONTEND, tableFor, rowFor, openDetail, ALLOW_WRITES, ISOLATED_DB_MESSAGE } from './helpers/e2e.js';

test('Public consulta los listados sin abrir el formulario de login', async ({ page }) => {
  await page.goto(FRONTEND);
  await expect(tableFor(page, 'Jugadores')).toBeVisible();
  await expect(tableFor(page, 'Rosters')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
});

test('Public no tiene controles de creación en el catálogo', async ({ page }) => {
  await page.goto(FRONTEND);
  await expect(tableFor(page, 'Jugadores')).toBeVisible();
  await expect(page.getByRole('button', { name: /Nuevo jugador/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Nuevo roster/i })).toHaveCount(0);
});

test.describe('Public anónimo: consultas de solo lectura', () => {
  test.skip(!ALLOW_WRITES, ISOLATED_DB_MESSAGE);

  test('Public ve los jugadores y rosters que existen en MySQL', async ({ page, records }) => {
    const player = await records.createPlayer();
    const roster = await records.createRoster();
    await page.goto(FRONTEND);
    await expect(rowFor(page, 'Jugadores', player.nickname)).toBeVisible();
    await expect(rowFor(page, 'Rosters', roster.nombre)).toBeVisible();
  });

  test('Public consulta el detalle de un jugador sin opciones de edición', async ({ page, records }) => {
    const player = await records.createPlayer();
    await page.goto(FRONTEND);
    const dialog = await openDetail(page, 'Jugadores', player.nickname);
    await expect(dialog).toContainText(player.nickname);
    await expect(dialog).toContainText('Top');
    await expect(dialog.getByRole('button', { name: 'Editar', exact: true })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Eliminar', exact: true })).toHaveCount(0);
  });

  test('Public consulta los integrantes de un roster sin controles administrativos', async ({ page, records }) => {
    const roster = await records.createRoster();
    const player = await records.createPlayer();
    await records.assign(roster, player, 'Suplente');
    await page.goto(FRONTEND);
    const dialog = await openDetail(page, 'Rosters', roster.nombre);
    await expect(dialog.getByRole('heading', { name: 'Jugadores del roster' })).toBeVisible();
    const row = dialog.locator('.integrantes tbody tr').filter({ hasText: player.nickname });
    await expect(row).toContainText('Suplente');
    await expect(dialog.getByRole('button', { name: 'Quitar' })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Editar' })).toHaveCount(0);
    await expect(dialog.getByRole('heading', { name: 'Agregar jugador existente' })).toHaveCount(0);
    await expect(dialog.locator('.rol-selector')).toHaveCount(0);
  });

  test('Public puede actualizar los listados sin iniciar sesión', async ({ page, records }) => {
    const roster = await records.createRoster();
    await page.goto(FRONTEND);
    await expect(rowFor(page, 'Rosters', roster.nombre)).toBeVisible();
    // Verifica la persistencia de los datos a través de una nueva carga.
    await page.reload();
    await expect(rowFor(page, 'Rosters', roster.nombre)).toBeVisible();
    await expect(page.getByRole('button', { name: /Nuevo roster/i })).toHaveCount(0);
  });
});
