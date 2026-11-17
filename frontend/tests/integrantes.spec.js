import { test, expect, signIn, openDetail, API, ALLOW_WRITES, ISOLATED_DB_MESSAGE } from './helpers/e2e.js';

test.describe('Admin: gestión de integrantes de roster', () => {
  test.skip(!ALLOW_WRITES, ISOLATED_DB_MESSAGE);

  test('Admin agrega un jugador existente como Suplente', async ({ page, records }) => {
    const roster = await records.createRoster();
    const player = await records.createPlayer();
    await signIn(page);
    const dialog = await openDetail(page, 'Rosters', roster.nombre);
    await dialog.locator('#jugador-disponible').selectOption(String(player.id));
    await dialog.locator('#rol-nuevo').selectOption('Suplente');
    await dialog.getByRole('button', { name: /Agregar al roster/ }).click();
    const row = dialog.locator('.integrantes tbody tr').filter({ hasText: player.nickname });
    await expect(row).toBeVisible();
    await expect(row.locator('select.rol-selector')).toHaveValue('Suplente');
  });

  test('Admin cambia de Suplente a Titular', async ({ page, records, adminApi }) => {
    const roster = await records.createRoster();
    const player = await records.createPlayer();
    await records.assign(roster, player, 'Suplente');
    await signIn(page);
    const dialog = await openDetail(page, 'Rosters', roster.nombre);
    const row = dialog.locator('.integrantes tbody tr').filter({ hasText: player.nickname });
    await expect(row).toBeVisible();
    await row.locator('.rol-selector').selectOption('Titular');
    await row.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(dialog.getByRole('status')).toContainText('Rol actualizado correctamente');
    await expect(row.locator('.rol-selector')).toHaveValue('Titular');
    const r = await adminApi.get(`${API}/rosters/${roster.id}/jugadores`);
    expect(r.status()).toBe(200);
    const data = await r.json();
    expect(data.jugadores.find(a => a.id_jugador === player.id)?.rol_en_roster).toBe('Titular');
  });

  test('Admin quita un jugador del roster sin borrarlo de MySQL', async ({ page, records, adminApi }) => {
    const roster = await records.createRoster();
    const player = await records.createPlayer();
    await records.assign(roster, player, 'Suplente');
    await signIn(page);
    const dialog = await openDetail(page, 'Rosters', roster.nombre);
    const row = dialog.locator('.integrantes tbody tr').filter({ hasText: player.nickname });
    await expect(row).toBeVisible();
    page.once('dialog', confirm => confirm.accept());
    await row.getByRole('button', { name: 'Quitar' }).click();
    await expect(row).toHaveCount(0);
    const r = await adminApi.get(`${API}/jugadores/${player.id}`);
    expect(r.status()).toBe(200);
  });

  test('Admin puede actualizar la lista de integrantes', async ({ page, records }) => {
    const roster = await records.createRoster();
    const player = await records.createPlayer();
    await records.assign(roster, player);
    await signIn(page);
    const dialog = await openDetail(page, 'Rosters', roster.nombre);
    await dialog.getByRole('button', { name: 'Actualizar' }).click();
    await expect(dialog.locator('.integrantes tbody tr').filter({ hasText: player.nickname })).toBeVisible();
  });
});
