import { useState } from 'react'
import { updateUser } from '../api/users.api'

/**
 * Hook para actualizar la información de un usuario
 * @returns {Object} { updateUserData, loading, error, success }
 */
export default function useUserUpdate() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const updateUserData = async (userId, userData) => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)
            const data = await updateUser(userId, userData)
            setSuccess(true)
            return data
        } catch (err) {
            console.error('Error updating user:', err)
            const errorMessage = err.response?.data?.errors 
                ? err.response.data.errors.join(', ')
                : err.response?.data?.error || 'Error al actualizar la información'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { updateUserData, loading, error, success }
}
