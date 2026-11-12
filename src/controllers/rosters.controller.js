import rostersService from '../services/rosters.service.js';

const obtenerTodos = async (req, res) => {
    const rosters = await rostersService.listar(req.query);
    res.status(200).json({
        success: true,
        rosters
    });
};

const obtenerPorId = async (req, res) => {
    const roster = await rostersService.obtenerPorId(req.params.id);
    res.status(200).json({
        success: true,
        roster
    });
};

const crearRoster = async (req, res) => {
    const roster = await rostersService.crear(req.body);
    res.status(201).json({
        success: true,
        roster
    });
};

const actualizarRoster = async (req, res) => {
    const roster = await rostersService.actualizar(req.params.id, req.body);
    res.status(200).json({
        success: true,
        roster
    });
};

const eliminarRoster = async (req, res) => {
    await rostersService.eliminar(req.params.id);
    res.status(204).send();
};

export default {
    obtenerTodos,
    obtenerPorId,
    crearRoster,
    actualizarRoster,
    eliminarRoster
};