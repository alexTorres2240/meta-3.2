const { Jugador } = require('../models');
const { Op } = require('sequelize');

const obtenerTodos = async (req, res) => {
    try {
        const { rol, estado, search } = req.query;
        const where = {};
        if (rol) where.rol = rol;
        if (estado) where.estado = estado;
        if (search) {
            where[Op.or] = [
                { nickname: { [Op.like]: `%${search}%` } },
                { nombre_real: { [Op.like]: `%${search}%` } },
                { pais: { [Op.like]: `%${search}%` } }
            ];
        }
        const jugadores = await Jugador.findAll();
        res.status(200).json({
            success: true,
            jugadores
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const obtenerPorId = async (req, res) => {
    try {
        const jugador = await Jugador.findByPk(req.params.id);
        if (!jugador) {
            return res.status(404).json({
                success: false
            });
        }
        res.status(200).json({
            success: true,
            jugador
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const crearJugador = async (req, res) => {
    try {
        const jugador = await Jugador.create(req.body);
        res.status(201).json({
            success: true,
            jugador
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const actualizarJugador = async (req, res) => {
    try {
        const [actualizado] = await Jugador.update(req.body, {
            where: { id: req.params.id }
        });
        if (!actualizado) {
            return res.status(404).json({
                success: false
            });
        }
        const jugador = await Jugador.findByPk(req.params.id);
        res.status(200).json({
            success: true,
            jugador
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const eliminarJugador = async (req, res) => {
    try {
        const eliminado = await Jugador.destroy({
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
    crearJugador,
    actualizarJugador,
    eliminarJugador
};