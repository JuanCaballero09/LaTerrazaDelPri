import { useState, useEffect } from 'react'
import { getOrders } from '../api/orders.api'

/**
 * Hook para obtener las órdenes de un usuario
 * @param {number} userId - ID del usuario (no se usa, se obtienen por token)
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
            // Usar la API de órdenes que devuelve items con product_name
            const response = await getOrders()
            setOrders(response.data || [])
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
