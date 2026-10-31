const jugadoresService = require('../services/jugadores.service');

const obtenerTodos = async (req, res) => {
    const jugadores = await jugadoresService.listar(req.query);
    res.status(200).json({
        success: true,
        jugadores
    });
};

const obtenerPorId = async (req, res) => {
    const jugador = await jugadoresService.obtenerPorId(req.params.id);
    res.status(200).json({
        success: true,
        jugador
    });
};

const crearJugador = async (req, res) => {
    const jugador = await jugadoresService.crear(req.body);
    res.status(201).json({
        success: true,
        jugador
    });
};

const actualizarJugador = async (req, res) => {
    const jugador = await jugadoresService.actualizar(req.params.id, req.body);
    res.status(200).json({
        success: true,
        jugador
    });
};

const eliminarJugador = async (req, res) => {
    await jugadoresService.eliminar(req.params.id);
    res.status(204).send();
};

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crearJugador,
    actualizarJugador,
    eliminarJugador
};