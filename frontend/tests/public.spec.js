import { test, expect, signIn, tableFor, rowFor, openDetail, ALLOW_WRITES, ISOLATED_DB_MESSAGE } from './helpers/e2e.js';

// Estas dos pruebas son de SOLO LECTURA y pueden ejecutarse sin base aislada.
test('Public puede consultar los listados sin modificar registros', async ({ page }) => {
  await signIn(page, 'public');
  await expect(tableFor(page, 'Jugadores')).toBeVisible();
  await expect(tableFor(page, 'Rosters')).toBeVisible();
});

test('Public no tiene controles de creación en el dashboard', async ({ page }) => {
  await signIn(page, 'public');
  await expect(page.getByRole('button', { name: /Nuevo jugador/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Nuevo roster/i })).toHaveCount(0);
});

test.describe('Rol Public: consultas de solo lectura', () => {
  test.skip(!ALLOW_WRITES, ISOLATED_DB_MESSAGE);

  test('Public consulta tablas de jugadores y rosters', async ({ page, records }) => {
    const player = await records.createPlayer();
    const roster = await records.createRoster();
    await signIn(page, 'public');

    await expect(tableFor(page, 'Jugadores')).toBeVisible();
    await expect(tableFor(page, 'Rosters')).toBeVisible();
    await expect(rowFor(page, 'Jugadores', player.nickname)).toBeVisible();
    await expect(rowFor(page, 'Rosters', roster.nombre)).toBeVisible();
  });

  test('Public abre y consulta detalle de jugador', async ({ page, records }) => {
    const player = await records.createPlayer();
    await signIn(page, 'public');
    const dialog = await openDetail(page, 'Jugadores', player.nickname);
    await expect(dialog).toContainText(player.nickname);
    await expect(dialog).toContainText('Top');
    await expect(dialog.getByRole('button', { name: 'Editar', exact: true })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Eliminar', exact: true })).toHaveCount(0);
  });

  test('Public abre roster y consulta sus integrantes', async ({ page, records }) => {
    const roster = await records.createRoster();
    const player = await records.createPlayer();
    await records.assign(roster, player, 'Suplente');
    await signIn(page, 'public');

    const dialog = await openDetail(page, 'Rosters', roster.nombre);
    await expect(dialog.getByRole('heading', { name: 'Jugadores del roster' })).toBeVisible();
    const row = dialog.locator('.integrantes tbody tr').filter({ hasText: player.nickname });
    await expect(row).toContainText('Suplente');
    await expect(dialog.getByRole('button', { name: 'Quitar' })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Editar' })).toHaveCount(0);
    await expect(dialog.getByRole('heading', { name: 'Agregar jugador existente' })).toHaveCount(0);
    await expect(dialog.locator('.rol-selector')).toHaveCount(0);
  });

  test('Public no ve botones para crear registros', async ({ page, records }) => {
    await records.createRoster();
    await signIn(page, 'public');
    await expect(page.getByRole('button', { name: /Nuevo jugador/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Nuevo roster/i })).toHaveCount(0);
  });
});
