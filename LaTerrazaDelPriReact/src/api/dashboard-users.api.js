import axios from './axios'

/**
 * Obtiene todos los usuarios (solo admin)
 * @returns {Promise} Lista de usuarios
 */
export const getAllUsers = async () => {
    const response = await axios.get('/dashboard/users')
    return response.data
}

/**
 * Actualiza un usuario (rol y estado activo)
 * @param {number} userId - ID del usuario
 * @param {Object} userData - { rol, activo }
 * @returns {Promise} Usuario actualizado
 */
export const updateUserAdmin = async (userId, userData) => {
    const response = await axios.patch(`/dashboard/users/${userId}`, { user: userData })
    return response.data
}
