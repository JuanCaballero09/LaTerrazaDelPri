import { useState, useEffect } from 'react';
import {
  getDashboardGrupos,
  createDashboardGrupo,
  updateDashboardGrupo,
  deleteDashboardGrupo
} from '../../api/dashboard.api';

export function useDashboardGrupos() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGrupos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardGrupos();
      setGrupos(response.data);
    } catch (err) {
      console.error('Error al cargar grupos:', err);
      setError(err.response?.data?.error || 'Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  const createGrupo = async (data) => {
    try {
      const response = await createDashboardGrupo(data);
      // Actualización optimista - agregar al inicio
      setGrupos(prevGrupos => [response.data, ...prevGrupos]);
      return { success: true };
    } catch (err) {
      console.error('Error al crear grupo:', err);
      return {
        success: false,
        error: err.response?.data?.errors?.join(', ') || 'Error al crear grupo'
      };
    }
  };

  const updateGrupo = async (id, data) => {
    try {
      const response = await updateDashboardGrupo(id, data);
      // Actualización optimista - actualizar solo el modificado
      setGrupos(prevGrupos => 
        prevGrupos.map(g => g.id === id ? response.data : g)
      );
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar grupo:', err);
      return {
        success: false,
        error: err.response?.data?.errors?.join(', ') || 'Error al actualizar grupo'
      };
    }
  };

  const deleteGrupo = async (id) => {
    try {
      await deleteDashboardGrupo(id);
      // Actualización optimista - remover del estado
      setGrupos(prevGrupos => prevGrupos.filter(g => g.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar grupo:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Error al eliminar grupo'
      };
    }
  };

  const filterGrupos = (searchTerm) => {
    if (!searchTerm) return grupos;
    
    const term = searchTerm.toLowerCase();
    return grupos.filter(grupo => 
      grupo.nombre?.toLowerCase().includes(term) ||
      grupo.descripcion?.toLowerCase().includes(term)
    );
  };

  const getStats = () => {
    return {
      total: grupos.length,
      conProductos: grupos.filter(g => (g.products_count || 0) > 0).length,
      sinProductos: grupos.filter(g => (g.products_count || 0) === 0).length
    };
  };

  return {
    grupos,
    loading,
    error,
    createGrupo,
    updateGrupo,
    deleteGrupo,
    filterGrupos,
    getStats,
    refresh: fetchGrupos
  };
}
