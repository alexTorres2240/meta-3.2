
import { test, expect } from '@playwright/test';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

// Cargar credenciales locales (Node.js 24)
loadEnvFile(
    fileURLToPath(new URL('../.env.e2e', import.meta.url))
);

const FRONTEND = 'http://localhost:5173';
const API = 'http://localhost:3000/api';

const cuentas = {
    admin: {
        correo: process.env.E2E_ADMIN_EMAIL,
        password: process.env.E2E_ADMIN_PASSWORD
    },
    public: {
        correo: process.env.E2E_PUBLIC_EMAIL,
        password: process.env.E2E_PUBLIC_PASSWORD
    }
};

// Comprobar que se configuraron las credenciales
for (const [rol, cuenta] of Object.entries(cuentas)) {
    if (!cuenta.correo || !cuenta.password) {
        throw new Error(
            `Faltan credenciales E2E para ${rol}`
        );
    }
}

// Función reutilizable para iniciar sesión
async function iniciarSesion(page, cuenta) {
    await page.goto(FRONTEND);

    await page.locator('input[type="email"]')
        .fill(cuenta.correo);

    await page.locator('input[type="password"]')
        .fill(cuenta.password);

    await page.getByRole('button', {
        name: 'Iniciar sesión'
    }).click();

    await expect(
        page.getByRole('button', { name: 'Cerrar sesión' })
    ).toBeVisible();
}

// Comprobar sesión a través del backend
async function comprobarRol(page, rolEsperado) {
    const respuesta = await page.context().request.get(
        `${API}/auth/me`
    );

    expect(respuesta.status()).toBe(200);

    const datos = await respuesta.json();

    expect(datos.success).toBe(true);
    expect(datos.usuario.rol).toBe(rolEsperado);
}

// ==========================================
// PRUEBA 1: LOGIN ADMIN
// ==========================================
test('Admin puede iniciar sesión', async ({ page }) => {
    await iniciarSesion(page, cuentas.admin);

    await comprobarRol(page, 'admin');
});

// ==========================================
// PRUEBA 2: LOGIN PUBLIC
// ==========================================
test('Public puede iniciar sesión', async ({ page }) => {
    await iniciarSesion(page, cuentas.public);

    await comprobarRol(page, 'usuario');
});

// ==========================================
// PRUEBA 3: CONTRASEÑA INCORRECTA
// ==========================================
test('Rechaza contraseña incorrecta', async ({ page }) => {
    await page.goto(FRONTEND);

    await page.locator('input[type="email"]')
        .fill(cuentas.admin.correo);

    await page.locator('input[type="password"]')
        .fill('contrasena-incorrecta-e2e');

    await page.getByRole('button', {
        name: 'Iniciar sesión'
    }).click();

    await expect(
        page.getByRole('alert')
    ).toContainText('Credenciales incorrectas');

    // No debe existir una sesión válida
    const respuesta = await page.context().request.get(
        `${API}/auth/me`
    );

    expect(respuesta.status()).toBe(401);
});

// ==========================================
// PRUEBA 4: CERRAR SESIÓN
// ==========================================
test('Admin puede cerrar sesión', async ({ page }) => {
    await iniciarSesion(page, cuentas.admin);

    await page.getByRole('button', {
        name: 'Cerrar sesión'
    }).click();

    // Debe regresar al formulario de login
    await expect(
        page.getByRole('button', { name: 'Iniciar sesión' })
    ).toBeVisible();

    // El JWT ya no debe autenticar solicitudes
    const respuesta = await page.context().request.get(
        `${API}/auth/me`
    );

    expect(respuesta.status()).toBe(401);
});
