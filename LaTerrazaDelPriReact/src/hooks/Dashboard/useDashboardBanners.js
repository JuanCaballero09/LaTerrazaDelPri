import { useState, useEffect } from 'react';
import { 
  getDashboardBanners,
  createDashboardBanner, 
  deleteDashboardBanner
} from '../../api/dashboard.api';

/**
 * Hook personalizado para manejar banners del dashboard
 * @returns {Object} - Estado y funciones CRUD de banners
 */
export function useDashboardBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Helper para obtener URL completa de imagen
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://localhost:3000${url}`;
  };

  // Cargar banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardBanners();
      setBanners(response.data || []);
    } catch (err) {
      console.error('Error al cargar banners:', err);
      setError('Error al cargar banners');
    } finally {
      setLoading(false);
    }
  };

  // Crear banner
  const createBanner = async (file) => {
    if (!file) {
      return { success: false, error: 'Selecciona una imagen' };
    }

    // Validaciones
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Archivo inválido. Selecciona una imagen' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'La imagen no debe superar los 5MB' };
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('banner[imagen]', file);

      await createDashboardBanner(formData);
      await fetchBanners();
      
      return { success: true };
    } catch (err) {
      console.error('Error al crear banner:', err);
      return { success: false, error: 'Error al crear el banner' };
    } finally {
      setUploading(false);
    }
  };

  // Eliminar banner
  const deleteBanner = async (id) => {
    try {
      await deleteDashboardBanner(id);
      await fetchBanners();
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar banner:', err);
      return { success: false, error: 'Error al eliminar el banner' };
    }
  };

  // Validar archivo
  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Selecciona un archivo de imagen válido' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'La imagen no debe superar los 5MB' };
    }

    return { valid: true };
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    loading,
    uploading,
    error,
    createBanner,
    deleteBanner,
    validateFile,
    getImageUrl,
    refresh: fetchBanners
  };
}
