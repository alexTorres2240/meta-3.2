import { test, expect, signIn, rowFor, openDetail, ALLOW_WRITES, ISOLATED_DB_MESSAGE } from './helpers/e2e.js';

test.describe('Admin: CRUD rosters', () => {
  test.skip(!ALLOW_WRITES, ISOLATED_DB_MESSAGE);

  test('Admin crea roster desde Vue', async ({ page, records }) => {
    const name = records.rosterName('nuevo');
    records.trackRosterName(name);
    await signIn(page);
    await page.getByRole('button', { name: /Nuevo roster/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Crear roster' })).toBeVisible();
    await dialog.getByLabel('Nombre del roster').fill(name);
    await dialog.getByLabel('Juego').fill('League Of Legends');
    await dialog.getByLabel('Tipo de roster').selectOption('Academia');
    await dialog.getByLabel('Temporada').fill('2026');
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(rowFor(page, 'Rosters', name)).toBeVisible();
  });

  test('Admin consulta detalle e integrantes de un roster', async ({ page, records }) => {
    const roster = await records.createRoster();
    await signIn(page);
    const dialog = await openDetail(page, 'Rosters', roster.nombre);
    await expect(dialog).toContainText(roster.nombre);
    await expect(dialog.getByRole('heading', { name: 'Jugadores del roster' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Editar', exact: true })).toBeVisible();
  });

  test('Admin edita un roster desde Vue', async ({ page, records }) => {
    const roster = await records.createRoster();
    await signIn(page);
    const dialog = await openDetail(page, 'Rosters', roster.nombre);
    await dialog.getByRole('button', { name: 'Editar', exact: true }).click();
    await dialog.getByLabel('Temporada').fill('2027');
    await dialog.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(rowFor(page, 'Rosters', roster.nombre)).toContainText('2027');
    const updated = await openDetail(page, 'Rosters', roster.nombre);
    await expect(updated).toContainText('2027');
  });

  test('Admin elimina un roster vacío desde Vue', async ({ page, records }) => {
    const roster = await records.createRoster();
    await signIn(page);
    const dialog = await openDetail(page, 'Rosters', roster.nombre);
    page.once('dialog', confirm => confirm.accept());
    await dialog.getByRole('button', { name: 'Eliminar', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(rowFor(page, 'Rosters', roster.nombre)).toHaveCount(0);
  });
});
