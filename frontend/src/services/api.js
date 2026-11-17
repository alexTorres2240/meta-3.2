
const API_URL = import.meta.env.VITE_API_URL;

function obtenerCookie(nombre) {
    const cookies = document.cookie.split('; ');

    const cookie = cookies.find(c =>
        c.startsWith(`${nombre}=`)
    );

    if (!cookie) return null;

    return decodeURIComponent(
        cookie.substring(nombre.length + 1)
    );
}

export async function api(ruta, opciones = {}) {
    const metodo = (opciones.method || 'GET').toUpperCase();
    const headers = {
        ...opciones.headers
    };
    const requiereCsrf = ['POST', 'PUT', 'PATCH', 'DELETE']
        .includes(metodo) && ruta !== '/auth/login';
    if (requiereCsrf) {
        const csrf = obtenerCookie('csrf_token');
        if (!csrf) {
            throw new Error(
                'No se encontró el token CSRF. Inicia sesión nuevamente.'
            );
        }
        headers['X-CSRF-Token'] = csrf;
    }
    if (opciones.body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        method: metodo,
        credentials: 'include',
        headers,
        body: opciones.body === undefined
            ? undefined
            : JSON.stringify(opciones.body)
    });
    const datos = respuesta.status === 204
        ? null
        : await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
        const error = new Error(
            datos?.error || `Error HTTP ${respuesta.status}`
        );
        error.status = respuesta.status;
        throw error;
    }
    return datos;
}
