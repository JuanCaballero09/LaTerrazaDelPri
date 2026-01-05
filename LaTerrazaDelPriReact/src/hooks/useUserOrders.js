import { useState, useEffect } from 'react'
import { getUserOrders } from '../api/users.api'

/**
 * Hook para obtener las órdenes de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Object} { orders, loading, error, refetch }
 */
export default function useUserOrders(userId) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchOrders = async () => {
        if (!userId) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            const data = await getUserOrders(userId)
            setOrders(data)
        } catch (err) {
            console.error('Error fetching user orders:', err)
            setError(err.response?.data?.error || 'Error al cargar las órdenes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [userId])

    const refetch = () => {
        fetchOrders()
    }

    return { orders, loading, error, refetch }
}
