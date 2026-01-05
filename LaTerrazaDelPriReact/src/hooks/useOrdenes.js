import { useState, useEffect } from 'react';
import { getAllOrdenes, updateOrdenEstado } from '../api/ordenes.api';

export function useOrdenes(filters = {}) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllOrdenes(filters);
      setOrdenes(response.data);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError(err.message || 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const updateEstado = async (ordenId, nuevoEstado) => {
    try {
      await updateOrdenEstado(ordenId, nuevoEstado);
      // Actualizar la orden en el estado local
      setOrdenes(prev => 
        prev.map(orden => 
          orden.id === ordenId 
            ? { ...orden, estado: nuevoEstado, fecha_actualizacion: new Date().toISOString() }
            : orden
        )
      );
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    ordenes,
    loading,
    error,
    refetch: fetchOrdenes,
    updateEstado
  };
}
