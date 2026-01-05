import { useState, useEffect } from 'react';
import { getDashboardOrders, cambiarEstadoOrden } from '../../api/dashboard.api';

/**
 * Hook personalizado para manejar órdenes del dashboard
 * @returns {Object} - Estado y funciones CRUD de órdenes
 */
export function useDashboardOrders() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar órdenes
  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardOrders();
      setOrdenes(response.data || []);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de orden
  const updateEstado = async (ordenCode, nuevoEstado) => {
    try {
      await cambiarEstadoOrden(ordenCode, nuevoEstado);
      // Actualizar estado local
      setOrdenes(prev => 
        prev.map(orden => 
          orden.code === ordenCode 
            ? { ...orden, status: nuevoEstado } 
            : orden
        )
      );
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      return { success: false, error: 'Error al actualizar el estado de la orden' };
    }
  };

  // Filtrar órdenes
  const filterOrdenes = (searchTerm, filterEstado) => {
    return ordenes.filter(orden => {
      const matchEstado = 
        filterEstado === 'all' || orden.status === filterEstado;
      
      const matchSearch = 
        orden.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.user?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.user?.apellido?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchEstado && matchSearch;
    });
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { label: 'Pendiente', class: 'pending' },
      pagado: { label: 'Pagado', class: 'confirmed' },
      tomado: { label: 'En Preparación', class: 'preparing' },
      finalizado: { label: 'Finalizado', class: 'delivered' },
      cancelado: { label: 'Cancelado', class: 'cancelled' }
    };
    return badges[estado] || badges.pendiente;
  };

  // Estadísticas
  const getStats = () => ({
    total: ordenes.length,
    pendientes: ordenes.filter(o => o.status === 'pendiente').length,
    enProceso: ordenes.filter(o => ['pagado', 'tomado'].includes(o.status)).length,
    finalizadas: ordenes.filter(o => o.status === 'finalizado').length
  });

  useEffect(() => {
    fetchOrdenes();
  }, []);

  return {
    ordenes,
    loading,
    error,
    updateEstado,
    filterOrdenes,
    getEstadoBadge,
    getStats,
    refresh: fetchOrdenes
  };
}
