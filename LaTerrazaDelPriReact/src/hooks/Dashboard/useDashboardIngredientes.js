import { useState, useEffect } from 'react';
import {
  getDashboardIngredientes,
  createDashboardIngrediente,
  updateDashboardIngrediente,
  deleteDashboardIngrediente
} from '../../api/dashboard.api';

export function useDashboardIngredientes() {
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIngredientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardIngredientes();
      setIngredientes(response.data);
    } catch (err) {
      console.error('Error al cargar ingredientes:', err);
      setError(err.response?.data?.error || 'Error al cargar ingredientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredientes();
  }, []);

  const createIngrediente = async (data) => {
    try {
      await createDashboardIngrediente(data);
      await fetchIngredientes();
      return { success: true };
    } catch (err) {
      console.error('Error al crear ingrediente:', err);
      return {
        success: false,
        error: err.response?.data?.errors?.join(', ') || 'Error al crear ingrediente'
      };
    }
  };

  const updateIngrediente = async (id, data) => {
    try {
      await updateDashboardIngrediente(id, data);
      await fetchIngredientes();
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar ingrediente:', err);
      return {
        success: false,
        error: err.response?.data?.errors?.join(', ') || 'Error al actualizar ingrediente'
      };
    }
  };

  const deleteIngrediente = async (id) => {
    try {
      await deleteDashboardIngrediente(id);
      await fetchIngredientes();
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar ingrediente:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Error al eliminar ingrediente'
      };
    }
  };

  const filterIngredientes = (searchTerm) => {
    if (!searchTerm) return ingredientes;
    
    const term = searchTerm.toLowerCase();
    return ingredientes.filter(ing => 
      ing.nombre?.toLowerCase().includes(term)
    );
  };

  const getStats = () => {
    return {
      total: ingredientes.length,
      conProductos: ingredientes.filter(i => (i.products?.length || 0) > 0).length,
      sinProductos: ingredientes.filter(i => (i.products?.length || 0) === 0).length
    };
  };

  return {
    ingredientes,
    loading,
    error,
    createIngrediente,
    updateIngrediente,
    deleteIngrediente,
    filterIngredientes,
    getStats,
    refresh: fetchIngredientes
  };
}
