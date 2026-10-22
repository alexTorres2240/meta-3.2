/**
 * Manejo de errores compartido por los controllers.
 *
 * Los services lanzan `AppError` con el código HTTP que corresponde
 * (400 datos inválidos, 404 no existe, 409 conflicto con una regla de negocio).
 * Los errores de Sequelize también se traducen aquí a una respuesta clara.
 */
class AppError extends Error {
    constructor(status, message, extra = {}) {
        super(message);
        this.status = status;
        this.extra = extra;
    }
}

// Convierte un valor a entero positivo o lanza 400
const parsearId = (valor, nombre = 'id') => {
    const n = Number(valor);
    if (!Number.isInteger(n) || n <= 0) {
        throw new AppError(400, `El ${nombre} debe ser un número entero positivo`);
    }
    return n;
};

// Verifica que vengan todos los campos requeridos en el body
const requerir = (datos, campos) => {
    const faltantes = campos.filter(c => datos[c] === undefined || datos[c] === null || datos[c] === '');
    if (faltantes.length > 0) {
        throw new AppError(400, `Faltan campos requeridos: ${faltantes.join(', ')}`, { faltantes });
    }
};

// Limpia espacios y convierte a string (si hay valor)
const limpiar = (valor) => (valor === undefined || valor === null ? valor : String(valor).trim());

const manejarError = (res, error, mensajeGenerico = 'Error interno') => {
    if (error instanceof AppError) {
        return res.status(error.status).json({ success: false, message: error.message, ...error.extra });
    }

    if (error.name === 'SequelizeValidationError') {
        const errores = error.errors.map(e => e.message);
        return res.status(400).json({ success: false, message: 'Datos inválidos', errores });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, message: 'El registro ya existe (valor duplicado)' });
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ success: false, message: 'La operación viola una relación con otros registros' });
    }

    res.status(500).json({ success: false, message: mensajeGenerico, error: error.message });
};

module.exports = { AppError, parsearId, requerir, limpiar, manejarError };
