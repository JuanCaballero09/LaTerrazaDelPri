import { useState, useEffect } from 'react';
import { useDashboardBanners } from '../../../hooks/Dashboard/useDashboardBanners';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { ImageUpload } from '../../../components/ui/ImageUpload/ImageUpload';
import './Dashboard.css';

export function BannersCRUD() {
  const {
    banners,
    loading,
    uploading,
    createBanner: uploadBanner,
    deleteBanner: removeBanner,
    validateFile,
    getImageUrl
  } = useDashboardBanners();

  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showModal]);

  const handleOpenModal = () => {
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert('Por favor selecciona una imagen');
      return;
    }

    const result = await uploadBanner(imageFile);
    
    if (result.success) {
      handleCloseModal();
      alert('Banner creado exitosamente');
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este banner?')) return;

    const result = await removeBanner(id);
    if (result.success) {
      alert('Banner eliminado exitosamente');
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="crud-loading">
        <div className="loading-spinner"></div>
        <p>Cargando banners...</p>
      </div>
    );
  }

  return (
    <div className="crud-container">
      {/* Header */}
      <div className="crud-header">
        <div className="crud-title-section">
          <h1>
            <ImageIcon 
              size={28} 
              style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} 
            /> 
            Gestión de Banners
          </h1>
          <p className="crud-subtitle">Administra los banners de la página principal</p>
        </div>
        <button className="dashboard-btn-primary" onClick={handleOpenModal}>
          <Plus size={20} style={{ marginRight: '6px' }} /> 
          Nuevo Banner
        </button>
      </div>

      <div className='banner-infos'>
        {/* Info Alert */}
        <div className="info-alert">
          <AlertCircle size={20} />
          <div>
            <strong>Recomendaciones:</strong>
            <ul>
              <li>Relación de aspecto: 16:9 (ej: 1920x1080, 1600x900, 1280x720)</li>
              <li>Formato: JPG, PNG o WebP</li>
              <li>Tamaño máximo: 5MB</li>
              <li>Los banners se mostrarán en el slider de la página principal</li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="crud-stats">
          <div className="stat-item">
            <span className="stat-label">Total Banners</span>
            <span className="stat-value">{banners.length}</span>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="banners-grid">
        {banners.map(banner => {
          const imageUrl = getImageUrl(banner.imagen_url);
          return (
            <div key={banner.id} className="banner-card">
              <div className="banner-image-container">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`Banner ${banner.id}`}
                    className="banner-image"
                    onError={(e) => {
                      console.error('Error cargando imagen:', imageUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="banner-image-placeholder" 
                  style={{ display: imageUrl ? 'none' : 'flex' }}
                >
                  <ImageIcon size={48} />
                  <p>Sin imagen</p>
                </div>
              </div>
              <div className="banner-card-footer">
                <div className="banner-info">
                  <span className="banner-id">ID: {banner.id}</span>
                  <span className="banner-date">
                    {new Date(banner.created_at).toLocaleDateString('es-CO')}
                  </span>
                </div>
                <button
                  className="dashboard-btn-icon dashboard-btn-delete"
                  onClick={() => handleDelete(banner.id)}
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {banners.length === 0 && (
        <div className="dashboard-empty-state">
          <ImageIcon size={64} />
          <p>No hay banners creados</p>
          <button className="dashboard-btn-primary" onClick={handleOpenModal}>
            <Plus size={20} style={{ marginRight: '6px' }} /> 
            Crear Primer Banner
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="dashboard-modal-overlay" onClick={handleCloseModal}>
          <div 
            className="dashboard-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dashboard-modal-header">
              <h2>Nuevo Banner</h2>
              <button 
                className="dashboard-modal-close" 
                onClick={handleCloseModal}
                disabled={uploading}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="dashboard-modal-form">
              <div className="dashboard-form-group full-width">
                <ImageUpload
                  imageFile={imageFile}
                  imagePreview={imagePreview}
                  onImageChange={(file, preview) => {
                    // Validar el archivo
                    const validation = validateFile(file);
                    if (!validation.valid) {
                      alert(validation.error);
                      return;
                    }
                    setImageFile(file);
                    setImagePreview(preview);
                  }}
                  onImageRemove={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  label="Imagen del Banner"
                  required
                  disabled={uploading}
                />
              </div>

              <div className="dashboard-modal-actions">
                <button 
                  type="button" 
                  className="dashboard-btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="dashboard-btn-primary"
                  disabled={uploading || !imageFile}
                >
                  {uploading ? 'Subiendo...' : 'Crear Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
