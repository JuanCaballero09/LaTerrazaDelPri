import axios from './axios'

/**
 * Obtiene la información completa de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise} Datos del usuario con direcciones y órdenes
 */
export const getUserProfile = async (userId) => {
    const response = await axios.get(`/users/${userId}`)
    return response.data
}

/**
 * Obtiene las direcciones de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise} Lista de direcciones
 */
export const getUserAddresses = async (userId) => {
    const response = await axios.get(`/users/${userId}/addresses`)
    return response.data
}

/**
 * Obtiene las órdenes de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise} Lista de órdenes
 */
export const getUserOrders = async (userId) => {
    const response = await axios.get(`/users/${userId}/orders`)
    return response.data
}

/**
 * Actualiza la información de un usuario
 * @param {number} userId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise} Datos actualizados del usuario
 */
export const updateUser = async (userId, userData) => {
    const response = await axios.patch(`/users/${userId}`, { user: userData })
    return response.data
}

/**
 * Elimina la cuenta de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise}
 */
export const deleteUser = async (userId) => {
    const response = await axios.delete(`/users/${userId}`)
    return response.data
}

/**
 * Crea una nueva dirección para el usuario
 * @param {number} userId - ID del usuario
 * @param {Object} addressData - Datos de la dirección
 * @returns {Promise} Dirección creada
 */
export const createAddress = async (userId, addressData) => {
    const response = await axios.post(`/users/${userId}/addresses`, { direccion: addressData })
    return response.data
}

/**
 * Actualiza una dirección existente
 * @param {number} userId - ID del usuario
 * @param {number} addressId - ID de la dirección
 * @param {Object} addressData - Datos actualizados
 * @returns {Promise} Dirección actualizada
 */
export const updateAddress = async (userId, addressId, addressData) => {
    const response = await axios.patch(`/users/${userId}/addresses/${addressId}`, { direccion: addressData })
    return response.data
}

/**
 * Elimina una dirección
 * @param {number} userId - ID del usuario
 * @param {number} addressId - ID de la dirección
 * @returns {Promise}
 */
export const deleteAddress = async (userId, addressId) => {
    const response = await axios.delete(`/users/${userId}/addresses/${addressId}`)
    return response.data
}
