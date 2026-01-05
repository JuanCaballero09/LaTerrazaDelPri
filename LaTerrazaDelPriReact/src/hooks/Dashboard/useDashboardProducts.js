import { useState, useEffect } from 'react';
import { 
  getDashboardProducts, 
  createDashboardProduct, 
  updateDashboardProduct, 
  deleteDashboardProduct,
  toggleProductDisponibilidad 
} from '../../api/dashboard.api';

/**
 * Hook personalizado para manejar productos del dashboard
 * @returns {Object} - Estado y funciones CRUD de productos
 */
export function useDashboardProducts() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos
  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardProducts();
      setProductos(response.data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Crear producto
  const createProducto = async (data) => {
    try {
      const response = await createDashboardProduct(data);
      // Agregar el nuevo producto al inicio de la lista
      setProductos(prevProductos => [response.data, ...prevProductos]);
      return { success: true };
    } catch (err) {
      console.error('Error al crear producto:', err);
      console.error('Respuesta del servidor:', err.response?.data);
      
      const errorMessage = err.response?.data?.errors 
        ? (Array.isArray(err.response.data.errors) 
            ? err.response.data.errors.join(', ') 
            : err.response.data.errors)
        : err.response?.data?.error 
        || 'Error al crear el producto';
      
      return { success: false, error: errorMessage, details: err.response?.data };
    }
  };

  // Actualizar producto
  const updateProducto = async (id, data) => {
    try {
      const response = await updateDashboardProduct(id, data);
      // Actualización optimista - actualizar solo el producto modificado
      setProductos(prevProductos => 
        prevProductos.map(p => p.id === id ? response.data : p)
      );
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      console.error('Respuesta del servidor:', err.response?.data);
      
      const errorMessage = err.response?.data?.errors 
        ? (Array.isArray(err.response.data.errors) 
            ? err.response.data.errors.join(', ') 
            : err.response.data.errors)
        : err.response?.data?.error 
        || 'Error al actualizar el producto';
      
      return { success: false, error: errorMessage, details: err.response?.data };
    }
  };

  // Eliminar producto
  const deleteProducto = async (id) => {
    try {
      await deleteDashboardProduct(id);
      // Actualización optimista - remover del estado local
      setProductos(prevProductos => prevProductos.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      return { success: false, error: 'Error al eliminar el producto' };
    }
  };

  // Toggle disponibilidad
  const toggleDisponibilidad = async (id) => {
    try {
      const response = await toggleProductDisponibilidad(id);
      // Actualización optimista - actualizar solo la disponibilidad
      setProductos(prevProductos => 
        prevProductos.map(p => 
          p.id === id ? { ...p, disponible: response.data.disponible } : p
        )
      );
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar disponibilidad:', err);
      return { success: false, error: 'Error al actualizar disponibilidad' };
    }
  };

  // Filtrar productos
  const filterProductos = (searchTerm, filterCategoria, filterEstado) => {
    return productos.filter(producto => {
      const matchSearch = 
        producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategoria = 
        filterCategoria === 'all' || producto.type === filterCategoria;
      
      const matchEstado = 
        filterEstado === 'all' || 
        (filterEstado === 'disponible' && producto.disponible) ||
        (filterEstado === 'no_disponible' && !producto.disponible);
      
      return matchSearch && matchCategoria && matchEstado;
    });
  };

  // Estadísticas
  const getStats = () => ({
    total: productos.length,
    disponibles: productos.filter(p => p.disponible).length,
    noDisponibles: productos.filter(p => !p.disponible).length
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  return {
    productos,
    loading,
    error,
    createProducto,
    updateProducto,
    deleteProducto,
    toggleDisponibilidad,
    filterProductos,
    getStats,
    refresh: fetchProductos
  };
}
