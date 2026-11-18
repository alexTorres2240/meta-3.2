import { request } from '@playwright/test';
import { mkdirSync, rmSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

loadEnvFile(fileURLToPath(new URL('../../.env.e2e', import.meta.url)));

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:5173';
const API = process.env.E2E_API_URL || 'http://localhost:3000/api';
const authDir = fileURLToPath(new URL('../../playwright/.auth/', import.meta.url));

export default async function globalSetup() {
  mkdirSync(authDir, { recursive: true });
  // Ya NO existe cuenta Public: limpia el estado de la suite antigua.
  rmSync(`${authDir}/public.json`, { force: true });

  const correo = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!correo || !password) {
    throw new Error('Completa E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD en frontend/.env.e2e');
  }

  // Un único login real inicial evita agotar el límite (10 intentos/15 min).
  const ctx = await request.newContext({ extraHTTPHeaders: { Origin: FRONTEND } });
  try {
    const response = await ctx.post(`${API}/auth/login`, {
      data: { correo, password }
    });
    if (!response.ok()) {
      throw new Error(`Login Admin de E2E: HTTP ${response.status()} ${await response.text()}`);
    }
    const data = await response.json();
    if (data.usuario?.rol !== 'admin') {
      throw new Error(`E2E requiere una cuenta Admin; se recibió '${data.usuario?.rol}'`);
    }
    await ctx.storageState({ path: `${authDir}/admin.json` });
  } finally {
    await ctx.dispose();
  }
}
