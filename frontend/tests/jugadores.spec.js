import { test, expect, signIn, rowFor, openDetail, ALLOW_WRITES, ISOLATED_DB_MESSAGE } from './helpers/e2e.js';

test.describe('Admin: CRUD jugadores', () => {
  test.skip(!ALLOW_WRITES, ISOLATED_DB_MESSAGE);

  test('Admin crea jugador desde Vue', async ({ page, records }) => {
    const name = records.playerName('nuevo');
    records.trackPlayerName(name); // incluso si falla una comprobación después de guardar
    await signIn(page);
    await page.getByRole('button', { name: /Nuevo jugador/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Crear jugador' })).toBeVisible();
    await dialog.getByLabel('Nickname').fill(name);
    await dialog.getByLabel('Nombre real').fill('Jugador de Playwright');
    await dialog.getByLabel('País').fill('México');
    await dialog.getByLabel('Posición').selectOption('Mid');
    await dialog.getByLabel('Estado').selectOption('activo');
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(rowFor(page, 'Jugadores', name)).toBeVisible();
  });

  test('Admin consulta el detalle de un jugador', async ({ page, records }) => {
    const player = await records.createPlayer({ pais: 'México' });
    await signIn(page);
    const dialog = await openDetail(page, 'Jugadores', player.nickname);
    await expect(dialog).toContainText(player.nickname);
    await expect(dialog).toContainText('México');
    await expect(dialog.getByRole('button', { name: 'Editar', exact: true })).toBeVisible();
  });

  test('Admin edita un jugador desde Vue', async ({ page, records }) => {
    const player = await records.createPlayer();
    await signIn(page);
    const dialog = await openDetail(page, 'Jugadores', player.nickname);
    await dialog.getByRole('button', { name: 'Editar', exact: true }).click();
    await dialog.getByLabel('País').fill('Canadá');
    await dialog.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(rowFor(page, 'Jugadores', player.nickname)).toContainText('Canadá');
    const updated = await openDetail(page, 'Jugadores', player.nickname);
    await expect(updated).toContainText('Canadá');
  });

  test('Admin elimina un jugador desde Vue', async ({ page, records }) => {
    const player = await records.createPlayer();
    await signIn(page);
    const dialog = await openDetail(page, 'Jugadores', player.nickname);
    page.once('dialog', confirm => confirm.accept());
    await dialog.getByRole('button', { name: 'Eliminar', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(rowFor(page, 'Jugadores', player.nickname)).toHaveCount(0);
  });
});
