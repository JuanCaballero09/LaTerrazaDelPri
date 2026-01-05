import { useState } from 'react';
import { useDashboardBanners } from '../../../hooks/Dashboard/useDashboardBanners';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  X, 
  Upload, 
  AlertCircle 
} from 'lucide-react';
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
  const [formData, setFormData] = useState({
    imagen: null,
    preview: null
  });

  const handleOpenModal = () => {
    setFormData({ imagen: null, preview: null });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ imagen: null, preview: null });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        imagen: file,
        preview: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.imagen) {
      alert('Por favor selecciona una imagen');
      return;
    }

    const result = await uploadBanner(formData.imagen);
    
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
                <label>Imagen del Banner *</label>
                
                {/* Upload Area */}
                <div className="upload-area">
                  <input
                    type="file"
                    id="banner-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="banner-upload" className="upload-label">
                    {formData.preview ? (
                      <div className="preview-container">
                        <img 
                          src={formData.preview} 
                          alt="Preview" 
                          className="preview-image"
                        />
                        <div className="preview-overlay">
                          <Upload size={32} />
                          <p>Click para cambiar imagen</p>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <Upload size={48} />
                        <p><strong>Click para seleccionar imagen</strong></p>
                        <p className="upload-hint">o arrastra y suelta aquí</p>
                        <p className="upload-specs">JPG, PNG o WebP (máx. 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                {formData.imagen && (
                  <div className="file-info">
                    <span className="file-name">{formData.imagen.name}</span>
                    <span className="file-size">
                      {(formData.imagen.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
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
                  disabled={uploading || !formData.imagen}
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
