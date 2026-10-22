const { Roster } = require('../models');

const obtenerTodos = async (req, res) => {
    try {
        const { tipo, temporada} = req.query;
        const where = {};
        if (tipo) where.tipo = tipo;
        if (temporada) where.temporada = temporada;
        const rosters = await Roster.findAll({ where });
        res.status(200).json({
            success: true,
            rosters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const obtenerPorId = async(req, res) => {
    try {
        const roster = await Roster.findByPk(req.params.id, {
            include: [{ association: 'jugadores' }]
        });
        if (!roster) {
            return res.status(404).json({
                success: false
            });
        }
        res.status(200).json({
            success: true,
            roster
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const crearRoster = async (req, res) => {
    try {
        const roster = await Roster.create(req.body);
        res.status(201).json({
            success: true,
            roster
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const actualizarRoster = async (req, res) => {
    try {
        const [actualizado] = await Roster.update(req.body, {
            where: { id: req.params.id }
        });
        if (!actualizado) {
            return res.status(404).json({
                success: false
            });
        }
        res.status(200).json({
            success: true,
            actualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const eliminarRoster = async (req, res) => {
    try {
        const eliminado = await Roster.destroy({
            where: { id: req.params.id }
        });
        if (!eliminado) {
            return res.status(404).json({
                success: false
            });
        }
        res.status(204).json({
            success: true,
            eliminado
        }).send();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crearRoster,
    actualizarRoster,
    eliminarRoster
};