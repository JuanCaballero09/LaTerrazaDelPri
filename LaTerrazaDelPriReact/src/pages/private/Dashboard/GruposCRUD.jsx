import { useState } from 'react';
import { useDashboardGrupos } from '../../../hooks/Dashboard/useDashboardGrupos';
import { Plus, Edit2, Trash2, X, Package, Image as ImageIcon } from 'lucide-react';
import ImageWithSkeleton from '../../../components/ui/Skeletons/ImageWithSkeleton';
import './Dashboard.css';

const INITIAL_FORM_DATA = {
  nombre: '',
  descripcion: '',
  imagen_url: ''
};

export function GruposCRUD() {
  const {
    grupos,
    loading,
    createGrupo,
    updateGrupo,
    deleteGrupo,
    filterGrupos,
    getStats
  } = useDashboardGrupos();

  const [showModal, setShowModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const stats = getStats();
  const filteredGrupos = filterGrupos(searchTerm);

  const handleOpenModal = (grupo = null) => {
    if (grupo) {
      setEditingGrupo(grupo);
      setFormData({
        nombre: grupo.nombre || '',
        descripcion: grupo.descripcion || '',
        imagen_url: grupo.imagen_url || ''
      });
      setImagePreview(grupo.imagen_url || null);
    } else {
      setEditingGrupo(null);
      setFormData(INITIAL_FORM_DATA);
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGrupo(null);
    setFormData(INITIAL_FORM_DATA);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Crear FormData si hay archivo de imagen
    let submitData;
    if (imageFile) {
      submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(`grupo[${key}]`, formData[key]);
        }
      });
      submitData.append('grupo[imagen]', imageFile);
    } else {
      submitData = formData;
    }
    
    const result = editingGrupo
      ? await updateGrupo(editingGrupo.id, submitData)
      : await createGrupo(submitData);

    if (result.success) {
      handleCloseModal();
      alert(editingGrupo ? 'Grupo actualizado exitosamente' : 'Grupo creado exitosamente');
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este grupo?')) return;

    const result = await deleteGrupo(id);
    if (result.success) {
      alert('Grupo eliminado exitosamente');
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="crud-loading">
        <div className="loading-spinner"></div>
        <p>Cargando grupos...</p>
      </div>
    );
  }

  return (
    <div className="crud-container">
      {/* Header */}
      <div className="crud-header">
        <div className="crud-title-section">
          <h1>📦 Gestión de Grupos</h1>
          <p className="crud-subtitle">Organiza tus productos en grupos</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="dashboard-btn-primary"
        >
          <Plus size={20} />
          Nuevo Grupo
        </button>
      </div>

      {/* Search */}
      <div className="crud-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="crud-stats">
        <div className="stat-item">
          <span className="stat-label">Total Grupos</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Con Productos</span>
          <span className="stat-value success">{stats.conProductos}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Sin Productos</span>
          <span className="stat-value warning">{stats.sinProductos}</span>
        </div>
      </div>

      {/* Grid de Grupos */}
      {filteredGrupos.length === 0 ? (
        <div className="dashboard-empty-state">
          <Package size={64} />
          <h3>No hay grupos</h3>
          <p>Agrega tu primer grupo para organizar productos</p>
        </div>
      ) : (
        <div className="grupos-grid">
          {filteredGrupos.map((grupo) => (
            <div key={grupo.id} className="grupo-card">              {grupo.imagen_url && (
                <div className="grupo-imagen">
                  <ImageWithSkeleton 
                    src={grupo.imagen_url}
                    alt={grupo.nombre}
                  />
                </div>
              )}
              {!grupo.imagen_url && (
                <div className="grupo-imagen-placeholder">
                  <Package size={32} />
                </div>
              )}              <div className="grupo-header">
                <h3>{grupo.nombre}</h3>
                <span className="grupo-products-count">
                  {grupo.products_count || 0} productos
                </span>
              </div>
              
              {grupo.descripcion && (
                <p className="grupo-descripcion">{grupo.descripcion}</p>
              )}
              
              <div className="grupo-actions">
                <button
                  onClick={() => handleOpenModal(grupo)}
                  className="dashboard-btn-icon"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(grupo.id)}
                  className="dashboard-btn-icon danger"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
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
              <h2>{editingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}</h2>
              <button 
                className="dashboard-modal-close" 
                onClick={handleCloseModal}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="dashboard-modal-form">
              <div className="dashboard-form-group">
                <label className="dashboard-form-label">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="dashboard-form-input"
                  required
                  placeholder="Ej: Pizzas, Bebidas, Postres"
                />
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-form-label">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="dashboard-form-textarea"
                  rows="3"
                  placeholder="Descripción del grupo (opcional)"
                />
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-form-label">Imagen del Grupo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImageFile(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="dashboard-form-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '8px' }} 
                    />
                  </div>
                )}
              </div>

              <div className="dashboard-modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="dashboard-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="dashboard-btn-primary"
                >
                  {editingGrupo ? 'Actualizar' : 'Crear'} Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
