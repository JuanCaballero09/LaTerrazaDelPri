import { useState, useEffect } from 'react';
import { getDashboardStats, getRecentOrders } from '../../api/dashboard.api';

/**
 * Hook personalizado para manejar estadísticas del dashboard
 * @returns {Object} - Estado y funciones del dashboard
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalVentas: 0,
    ordenesHoy: 0,
    productosActivos: 0,
    usuarios: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [statsResponse, ordersResponse] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5)
      ]);

      const statsData = statsResponse.data;

      setStats({
        totalVentas: statsData.revenue?.month || 0,
        ordenesHoy: statsData.orders?.today || 0,
        productosActivos: statsData.products?.disponibles || 0,
        usuarios: statsData.users?.total || 0
      });

      setRecentOrders(ordersResponse.data || []);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('No se puede conectar con el servidor. Asegúrate de que el backend esté corriendo en http://localhost:3000');
      } else if (err.response?.status === 401) {
        setError('No autorizado. Por favor inicia sesión nuevamente.');
      } else {
        setError(`Error al cargar datos: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setError(null);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    recentOrders,
    loading,
    error,
    retry
  };
}
