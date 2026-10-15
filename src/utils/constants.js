/**
 * Constantes compartidas del proyecto
 * Valores permitidos para validar y para los endpoints auxitliares
 */

// Posiciones de jugador
const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

// Estado de un jugador
const ESTADOS = ['activo', 'inactivo'];

// Tipo de roster
const TIPOS_ROSTER = ['Principal', 'Academia'];

// Rol dentro de un roster
const ROLES_ROSTER = ['Titular', 'Suplente'];

module.expors = {
    ROLES,
    ESTADOS,
    TIPOS_ROSTER,
    ROLES_ROSTER
};