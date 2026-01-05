import { useState } from 'react';
import { 
    Pizza, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Image as ImageIcon,
    X 
} from 'lucide-react';
import { useDashboardProducts } from '../../../hooks/Dashboard/useDashboardProducts';
import ImageWithSkeleton from '../../../components/ui/Skeletons/ImageWithSkeleton';
import './Dashboard.css';

const INITIAL_FORM_DATA = {
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
    tipo: 'Pizza',
    disponible: true,
    imagen_url: '',
    tamanos_disponibles: [],
    precios_por_tamano: {}
};

export function ProductosCRUD() {
    const {
        productos,
        loading,
        createProducto,
        updateProducto,
        deleteProducto,
        toggleDisponibilidad,
        filterProductos,
        getStats
    } = useDashboardProducts();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('all');
    const [filterEstado, setFilterEstado] = useState('all');
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const stats = getStats();
    const filteredProductos = filterProductos(searchTerm, filterCategoria, filterEstado);

    const handleOpenModal = (producto = null) => {
        if (producto) {
        setEditingProduct(producto);
        setFormData({
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            precio: producto.precio || '',
            categoria_id: producto.categoria_id || '',
            tipo: producto.type || 'Pizza',
            disponible: producto.disponible ?? true,
            imagen_url: producto.imagen_url || '',
            tamanos_disponibles: producto.tamanos_disponibles || [],
            precios_por_tamano: producto.precios_por_tamano || {}
        });
        setImagePreview(producto.imagen_url || null);
        } else {
        setEditingProduct(null);
        setFormData(INITIAL_FORM_DATA);
        setImagePreview(null);
        }
        setImageFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData(INITIAL_FORM_DATA);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Crear FormData para enviar archivo de imagen
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                submitData.append(`product[${key}]`, formData[key]);
            }
        });
        
        // Agregar imagen si hay archivo seleccionado
        if (imageFile) {
            submitData.append('product[imagen]', imageFile);
        }
        
        const result = editingProduct
            ? await updateProducto(editingProduct.id, submitData)
            : await createProducto(submitData);

        if (result.success) {
            handleCloseModal();
        } else {
            alert(result.error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        
        const result = await deleteProducto(id);
        if (!result.success) {
        alert(result.error);
        }
    };

    const handleToggleDisponible = async (producto) => {
        const result = await toggleDisponibilidad(producto.id);
        if (!result.success) {
        alert(result.error);
        }
    };

    if (loading) {
        return (
        <div className="crud-loading">
            <div className="loading-spinner"></div>
            <p>Cargando productos...</p>
        </div>
        );
    }

    return (
        <div className="crud-container">
        {/* Header */}
        <div className="crud-header">
            <div className="crud-title-section">
            <h1>
                <Pizza size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                Gestión de Productos
            </h1>
            <p className="crud-subtitle">Administra tu menú completo</p>
            </div>
            <button className="dashboard-btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={20} style={{ marginRight: '6px' }} />
            Nuevo Producto
            </button>
        </div>

        {/* Filters */}
        <div className="crud-filters">
            <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            </div>
            <div className="filter-group">
            <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="filter-select"
            >
                <option value="all">Todas las categorías</option>
                <option value="Pizza">Pizza</option>
                <option value="Bebida">Bebida</option>
                <option value="Acompañante">Acompañante</option>
                <option value="Combo">Combo</option>
            </select>
            <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="filter-select"
            >
                <option value="all">Todos los estados</option>
                <option value="disponible">Disponibles</option>
                <option value="no_disponible">No disponibles</option>
            </select>
            </div>
        </div>

        {/* Stats */}
        <div className="crud-stats">
            <div className="stat-item">
            <span className="stat-label">Total Productos</span>
            <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-item">
            <span className="stat-label">Disponibles</span>
            <span className="stat-value success">{stats.disponibles}</span>
            </div>
            <div className="stat-item">
            <span className="stat-label">No Disponibles</span>
            <span className="stat-value danger">{stats.noDisponibles}</span>
            </div>
        </div>

        {/* Products Table */}
        <div className="crud-table-container">
            <table className="crud-table">
            <thead>
                <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {filteredProductos.map(producto => (
                <tr key={producto.id}>
                    <td>
                    <div className="product-image">
                        {producto.imagen_url ? (
                        <ImageWithSkeleton 
                            src={producto.imagen_url} 
                            alt={producto.nombre}
                            className="dashboard-product-img"
                        />
                        ) : (
                        <div className="product-image-placeholder">
                            <ImageIcon size={24} />
                        </div>
                        )}
                    </div>
                    </td>
                    <td>
                    <div className="product-info">
                        <strong>{producto.nombre}</strong>
                        {producto.descripcion && (
                        <p className="product-description">{producto.descripcion}</p>
                        )}
                    </div>
                    </td>
                    <td>
                    <span className={`dashboard-badge dashboard-badge-${producto.type?.toLowerCase() || 'producto'}`}>
                        {producto.type || 'Producto'}
                    </span>
                    </td>
                    <td>
                    <strong>${producto.precio?.toLocaleString('es-CO')}</strong>
                    </td>
                    <td>
                    <label className="toggle-switch">
                        <input
                        type="checkbox"
                        checked={producto.disponible}
                        onChange={() => handleToggleDisponible(producto)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                    <span className={`status-text ${producto.disponible ? 'available' : 'unavailable'}`}>
                        {producto.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                    </td>
                    <td>
                    <div className="action-buttons">
                        <button
                        className="dashboard-btn-icon dashboard-btn-edit"
                        onClick={() => handleOpenModal(producto)}
                        title="Editar"
                        >
                        <Edit2 size={18} />
                        </button>
                        <button
                        className="dashboard-btn-icon dashboard-btn-delete"
                        onClick={() => handleDelete(producto.id)}
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

            {filteredProductos.length === 0 && (
            <div className="dashboard-empty-state">
                <ImageIcon size={48} />
                <p>No se encontraron productos</p>
            </div>
            )}
        </div>

        {/* Modal */}
        {showModal && (
            <div className="dashboard-modal-overlay" onClick={handleCloseModal}>
            <div className="dashboard-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="dashboard-modal-header">
                <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                <button className="dashboard-modal-close" onClick={handleCloseModal}>
                    <X size={24} />
                </button>
                </div>
                <form onSubmit={handleSubmit} className="dashboard-modal-form">
                <div className="dashboard-form-grid">
                    <div className="dashboard-form-group">
                    <label>Nombre *</label>
                    <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                    />
                    </div>

                    <div className="dashboard-form-group">
                    <label>Tipo *</label>
                    <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        required
                    >
                        <option value="Pizza">Pizza</option>
                        <option value="Bebida">Bebida</option>
                        <option value="Acompañante">Acompañante</option>
                        <option value="Combo">Combo</option>
                    </select>
                    </div>

                    <div className="dashboard-form-group">
                    <label>Precio *</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                        required
                    />
                    </div>

                    <div className="dashboard-form-group">
                    <label>Imagen del Producto</label>
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
                    />
                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '8px' }} />
                        </div>
                    )}
                    </div>

                    <div className="dashboard-form-group full-width">
                    <label>Descripción</label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows="3"
                    />
                    </div>

                    <div className="dashboard-form-group full-width">
                    <label className="dashboard-checkbox-label">
                        <input
                        type="checkbox"
                        checked={formData.disponible}
                        onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                        />
                        Producto disponible
                    </label>
                    </div>
                </div>

                <div className="dashboard-modal-actions">
                    <button type="button" className="dashboard-btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                    </button>
                    <button type="submit" className="dashboard-btn-primary">
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
}
