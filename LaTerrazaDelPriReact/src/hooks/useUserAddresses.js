import { useState, useEffect } from 'react'
import { getUserAddresses } from '../api/users.api'

/**
 * Hook para obtener las direcciones de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Object} { addresses, loading, error, refetch }
 */
export default function useUserAddresses(userId) {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchAddresses = async () => {
        if (!userId) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            const data = await getUserAddresses(userId)
            setAddresses(data)
        } catch (err) {
            console.error('Error fetching user addresses:', err)
            setError(err.response?.data?.error || 'Error al cargar las direcciones')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [userId])

    const refetch = () => {
        fetchAddresses()
    }

    return { addresses, loading, error, refetch }
}
