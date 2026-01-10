import { useState, useEffect, useRef, useCallback } from 'react';
import { getDashboardOrders, cambiarEstadoOrden } from '../../api/dashboard.api';
import { fetchSedes } from '../../api/sedes.api';

/**
 * Hook personalizado para manejar órdenes del dashboard
 * Con polling automático y notificación de sonido
 * @returns {Object} - Estado y funciones CRUD de órdenes
 */
export function useDashboardOrders() {
  const [ordenes, setOrdenes] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSede, setFilterSede] = useState('all');
  const previousOrdersRef = useRef([]);
  const audioContextRef = useRef(null);

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    try {
      // Crear AudioContext si no existe
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Sonido tipo "ding" amigable
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // Nota A5
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1); // Subir
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // Volver
      
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      // Segundo tono para hacerlo más notorio
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.setValueAtTime(1320, ctx.currentTime);
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.3);
      }, 200);

    } catch (err) {
      console.log('No se pudo reproducir sonido:', err);
    }
  }, []);

  // Cargar sedes
  const fetchSedesData = async () => {
    try {
      const data = await fetchSedes();
      setSedes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar sedes:', err);
    }
  };

  // Cargar órdenes
  const fetchOrdenes = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      setError(null);
      
      const response = await getDashboardOrders();
      const newOrdenes = response.data || [];
      
      // Verificar si hay nuevas órdenes pagadas
      if (isPolling && previousOrdersRef.current.length > 0) {
        const previousPagadas = previousOrdersRef.current
          .filter(o => o.status === 'pagado')
          .map(o => o.id);
        
        const newPagadas = newOrdenes.filter(
          o => o.status === 'pagado' && !previousPagadas.includes(o.id)
        );
        
        if (newPagadas.length > 0) {
          console.log('🔔 Nueva(s) orden(es) pagada(s):', newPagadas.length);
          playNotificationSound();
        }
      }
      
      previousOrdersRef.current = newOrdenes;
      setOrdenes(newOrdenes);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      if (!isPolling) setError('Error al cargar órdenes');
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [playNotificationSound]);

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

  // Tomar orden (cambiar a 'tomado')
  const tomarOrden = async (ordenCode) => {
    return await updateEstado(ordenCode, 'tomado');
  };

  // Cancelar orden
  const cancelarOrden = async (ordenCode) => {
    return await updateEstado(ordenCode, 'cancelado');
  };

  // Finalizar orden
  const finalizarOrden = async (ordenCode) => {
    return await updateEstado(ordenCode, 'finalizado');
  };

  // Filtrar órdenes por sede y estado
  const filterOrdenes = (searchTerm = '', filterEstado = 'all') => {
    return ordenes.filter(orden => {
      // Filtrar por sede - verificar múltiples posibles campos
      const ordenSedeId = orden.sede_id || orden.sede?.id || orden.sedeId;
      const matchSede = filterSede === 'all' || ordenSedeId?.toString() === filterSede;
      
      // Filtrar por estado
      const matchEstado = filterEstado === 'all' || orden.status === filterEstado;
      
      // Filtrar por búsqueda
      const matchSearch = !searchTerm || 
        orden.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.user?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.user?.apellido?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchSede && matchEstado && matchSearch;
    });
  };

  // Obtener órdenes pagadas (pendientes de tomar)
  const getOrdenesPagadas = () => {
    return ordenes.filter(orden => {
      const ordenSedeId = orden.sede_id || orden.sede?.id || orden.sedeId;
      const matchSede = filterSede === 'all' || ordenSedeId?.toString() === filterSede;
      return orden.status === 'pagado' && matchSede;
    });
  };

  // Obtener órdenes en preparación
  const getOrdenesEnPreparacion = () => {
    return ordenes.filter(orden => {
      const ordenSedeId = orden.sede_id || orden.sede?.id || orden.sedeId;
      const matchSede = filterSede === 'all' || ordenSedeId?.toString() === filterSede;
      return orden.status === 'tomado' && matchSede;
    });
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { label: 'Pendiente', class: 'pending', icon: '⏳' },
      pagado: { label: 'Pagado', class: 'confirmed', icon: '💰' },
      tomado: { label: 'En Preparación', class: 'preparing', icon: '👨‍🍳' },
      finalizado: { label: 'Finalizado', class: 'delivered', icon: '✅' },
      cancelado: { label: 'Cancelado', class: 'cancelled', icon: '❌' }
    };
    return badges[estado] || badges.pendiente;
  };

  // Estadísticas
  const getStats = () => {
    const filteredBysede = ordenes.filter(o => {
      const ordenSedeId = o.sede_id || o.sede?.id || o.sedeId;
      return filterSede === 'all' || ordenSedeId?.toString() === filterSede;
    });
    
    return {
      total: filteredBysede.length,
      pendientes: filteredBysede.filter(o => o.status === 'pendiente').length,
      pagadas: filteredBysede.filter(o => o.status === 'pagado').length,
      enPreparacion: filteredBysede.filter(o => o.status === 'tomado').length,
      finalizadas: filteredBysede.filter(o => o.status === 'finalizado').length,
      canceladas: filteredBysede.filter(o => o.status === 'cancelado').length
    };
  };

  // Efecto inicial
  useEffect(() => {
    fetchOrdenes();
    fetchSedesData();
  }, []);

  // Polling cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrdenes(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrdenes]);

  return {
    ordenes,
    sedes,
    loading,
    error,
    filterSede,
    setFilterSede,
    updateEstado,
    tomarOrden,
    cancelarOrden,
    finalizarOrden,
    filterOrdenes,
    getOrdenesPagadas,
    getOrdenesEnPreparacion,
    getEstadoBadge,
    getStats,
    refresh: fetchOrdenes,
    playNotificationSound
  };
}
