import { useState, useEffect, useCallback } from 'react';
import {
  getSedesRequest,
  getSedeRequest,
  createSedeRequest,
  updateSedeRequest,
  deleteSedeRequest,
  toggleSedeActivoRequest
} from '../../api/sedes.api';

export const useDashboardSedes = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todas las sedes
  const fetchSedes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSedesRequest(params);
      setSedes(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.errors || ['Error al cargar las sedes']);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una sede específica
  const fetchSede = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSedeRequest(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar la sede');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una nueva sede
  const createSede = useCallback(async (sedeData) => {
    setLoading(true);
    setError(null);
    try {
      const newSede = await createSedeRequest(sedeData);
      setSedes(prev => [...prev, newSede]);
      return newSede;
    } catch (err) {
      setError(err.response?.data?.errors || ['Error al crear la sede']);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar una sede existente
  const updateSede = useCallback(async (id, sedeData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSede = await updateSedeRequest(id, sedeData);
      setSedes(prev => prev.map(sede => sede.id === id ? updatedSede : sede));
      return updatedSede;
    } catch (err) {
      setError(err.response?.data?.errors || ['Error al actualizar la sede']);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar una sede
  const deleteSede = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteSedeRequest(id);
      setSedes(prev => prev.filter(sede => sede.id !== id));
    } catch (err) {
      setError(err.response?.data?.errors || ['Error al eliminar la sede']);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Alternar estado activo/inactivo
  const toggleActivo = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await toggleSedeActivoRequest(id);
      setSedes(prev => prev.map(sede => 
        sede.id === id ? { ...sede, activo: response.activo } : sede
      ));
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar el estado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar sedes automáticamente al montar el hook
  useEffect(() => {
    fetchSedes();
  }, [fetchSedes]);

  return {
    sedes,
    loading,
    error,
    fetchSedes,
    fetchSede,
    createSede,
    updateSede,
    deleteSede,
    toggleActivo
  };
};
