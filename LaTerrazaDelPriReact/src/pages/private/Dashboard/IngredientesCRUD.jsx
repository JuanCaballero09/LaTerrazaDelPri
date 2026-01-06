import { useState, useEffect } from 'react';
import { useDashboardIngredientes } from '../../../hooks/Dashboard/useDashboardIngredientes';
import { Plus, Edit2, Trash2, X, Leaf, Beef} from 'lucide-react';
import './Dashboard.css';

const INITIAL_FORM_DATA = {
  nombre: ''
};

export function IngredientesCRUD() {
  const {
    loading,
    createIngrediente,
    updateIngrediente,
    deleteIngrediente,
    filterIngredientes,
    getStats
  } = useDashboardIngredientes();

  const [showModal, setShowModal] = useState(false);
  const [editingIngrediente, setEditingIngrediente] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = getStats();
  const filteredIngredientes = filterIngredientes(searchTerm);
  
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showModal]);

  const handleOpenModal = (ingrediente = null) => {
    if (ingrediente) {
      setEditingIngrediente(ingrediente);
      setFormData({
        nombre: ingrediente.nombre
      });
    } else {
      setEditingIngrediente(null);
      setFormData(INITIAL_FORM_DATA);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIngrediente(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = editingIngrediente
      ? await updateIngrediente(editingIngrediente.id, formData)
      : await createIngrediente(formData);

    if (result.success) {
      handleCloseModal();
      alert(editingIngrediente ? 'Ingrediente actualizado exitosamente' : 'Ingrediente creado exitosamente');
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este ingrediente?')) return;

    const result = await deleteIngrediente(id);
    if (result.success) {
      alert('Ingrediente eliminado exitosamente');
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="crud-loading">
        <div className="loading-spinner"></div>
        <p>Cargando ingredientes...</p>
      </div>
    );
  }

  return (
    <div className="crud-container">
      {/* Header */}
      <div className="crud-header">
        <div className="crud-title-section">
          <h1><Beef /> Gestión de Ingredientes</h1>
          <p className="crud-subtitle">Administra los ingredientes de tus productos</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="dashboard-btn-primary"
        >
          <Plus size={20} />
          Nuevo Ingrediente
        </button>
      </div>

      {/* Search */}
      <div className="crud-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="crud-stats">
        <div className="stat-item">
          <span className="stat-label">Total Ingredientes</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">En Uso</span>
          <span className="stat-value success">{stats.conProductos}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Sin Usar</span>
          <span className="stat-value warning">{stats.sinProductos}</span>
        </div>
      </div>

      {/* Tabla de Ingredientes */}
      {filteredIngredientes.length === 0 ? (
        <div className="dashboard-empty-state">
          <Leaf size={64} />
          <h3>No hay ingredientes</h3>
          <p>Agrega tu primer ingrediente para comenzar</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="crud-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredientes.map((ingrediente) => (
                <tr key={ingrediente.id}>
                  <td>
                    <strong>#{ingrediente.id}</strong>
                  </td>
                  <td>
                    <strong>{ingrediente.nombre}</strong>
                  </td>
                  <td>
                    <span className="items-count">
                      {ingrediente.products?.length || 0} producto(s)
                    </span>
                  </td>
                  <td>
                    <div className="table-actions ">
                      <button
                        onClick={() => handleOpenModal(ingrediente)}
                        className="dashboard-btn-icon dashboard-btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(ingrediente.id)}
                        className="dashboard-btn-icon dashboard-btn-delete"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <h2>{editingIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</h2>
              <button 
                className="dashboard-modal-close" 
                onClick={handleCloseModal}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="dashboard-modal-form">
              <div className="dashboard-form-group">
                <label className="dashboard-form-label">Nombre del Ingrediente *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="dashboard-form-input"
                  required
                  placeholder="Ej: Tomate, Queso, Jamón"
                />
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
                  {editingIngrediente ? 'Actualizar' : 'Crear'} Ingrediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
