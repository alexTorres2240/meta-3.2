const {
    ValidationError,
    UniqueConstraintError,
    ForeignKeyConstraintError,
    DatabaseError
} = require('sequelize');

const errorHandler = (err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: 'JSON inválido en el body'
        });
    }
    if (err.status) {
        return res.status(err.status).json({
            success: false,
            error: err.message
        });
    }
    if (err instanceof UniqueConstraintError) {
        const campos = err.errors.map(e => e.path);
        const mensaje = campos.includes('nickname')
            ? 'El nickname ya existe'
            : `Valor duplicado en: ${campos.join(', ')}`;
        return res.status(409).json({
            success: false,
            error: mensaje
        });
    }
    if (err instanceof ValidationError) {
        const mensaje = err.errors.map(e => e.message).join('; ');
        return res.status(400).json({
            success: false,
            error: mensaje
        });
    }
    if (err instanceof ForeignKeyConstraintError) {
        return res.status(409).json({
            success: false,
            error: 'Operación bloqueada por una referencia existente'
        });
    }
    if (err instanceof DatabaseError) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: 'Error en la base de datos'
        });
    }
    console.error(err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
};

module.exports = errorHandler;