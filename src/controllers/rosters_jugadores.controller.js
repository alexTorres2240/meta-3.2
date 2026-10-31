const rostersJugadoresService = require('../services/rosters_jugadores.service');

const listarJugadores = async (req, res) => {
    const jugadores = await rostersJugadoresService.listarPorRoster(req.params.id);
    res.status(200).json({
        success: true,
        jugadores
    });
};

const asignarJugador = async (req, res) => {
    const asignacion = await rostersJugadoresService.asignar({
        id_roster: req.params.id,
        id_jugador: req.body.id_jugador,
        rol_en_roster: req.body.rol_en_roster
    });
    res.status(200).json({
        success: true,
        asignacion
    });
};

const cambiarRol = async (req, res) => {
    const asignacion = await rostersJugadoresService.cambiarRol({
        id_roster: req.params.id,
        id_jugador: req.params.id_jugador,
        rol_en_roster: req.body.rol_en_roster
    });
    res.status(200).json({
        success: true,
        asignacion
    });
};

const quitarJugador = async (req, res) => {
    await rostersJugadoresService.quitar({
        id_roster: req.params.id,
        id_jugador: req.params.id_jugador
    });
    res.status(204).send();
};

module.exports = {
    listarJugadores,
    asignarJugador,
    cambiarRol,
    quitarJugador
};