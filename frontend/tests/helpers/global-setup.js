import { request } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

const env = fileURLToPath(new URL('../../.env.e2e', import.meta.url));
loadEnvFile(env);

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:5173';
const API = process.env.E2E_API_URL || 'http://localhost:3000/api';
const authDir = fileURLToPath(new URL('../../playwright/.auth/', import.meta.url));

export default async function globalSetup() {
  mkdirSync(authDir, { recursive: true });
  for (const role of ['admin', 'public']) {
    const label = role.toUpperCase();
    const correo = process.env[`E2E_${label}_EMAIL`];
    const password = process.env[`E2E_${label}_PASSWORD`];
    if (!correo || !password) {
      throw new Error(`Completa E2E_${label}_EMAIL y E2E_${label}_PASSWORD en frontend/.env.e2e`);
    }
    const ctx = await request.newContext({ extraHTTPHeaders: { Origin: FRONTEND } });
    try {
      const response = await ctx.post(`${API}/auth/login`, { data: { correo, password } });
      if (!response.ok()) {
        throw new Error(`No se pudo autenticar la cuenta ${role}: ${response.status()} ${await response.text()}`);
      }
      const data = await response.json();
      const expected = role === 'public' ? 'usuario' : 'admin';
      if (data.usuario?.rol !== expected) {
        throw new Error(`La cuenta ${role} tiene rol '${data.usuario?.rol}' en vez de '${expected}'`);
      }
      await ctx.storageState({ path: `${authDir}/${role}.json` });
    } finally {
      await ctx.dispose();
    }
  }
}
