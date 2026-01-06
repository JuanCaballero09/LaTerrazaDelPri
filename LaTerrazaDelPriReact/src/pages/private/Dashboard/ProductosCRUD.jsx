import { useState, useEffect } from 'react';
import { 
    Hamburger, 
    Plus, 
    Edit2, 
    Trash2, 
    Image as ImageIcon,
    X 
} from 'lucide-react';
import { useDashboardProducts } from '../../../hooks/Dashboard/useDashboardProducts';
import { useDashboardGrupos } from '../../../hooks/Dashboard/useDashboardGrupos';
import { useDashboardIngredientes } from '../../../hooks/Dashboard/useDashboardIngredientes';
import ImageWithSkeleton from '../../../components/ui/Skeletons/ImageWithSkeleton';
import { ImageUpload } from '../../../components/ui/ImageUpload/ImageUpload';
import './Dashboard.css';

// Tamaños disponibles según tipo de producto
const TAMANOS_PIZZA = ['Personal', 'Mediana', 'Grande', 'Familiar'];
const TAMANOS_BEBIDA = ['Personal', '300ml', '500ml', 'Litro', '1.5L', '2L', '3L'];
const TAMANOS_ACOMPANANTE = ['Pequeña', 'Mediana', 'Grande'];

const INITIAL_FORM_DATA = {
    nombre: '',
    descripcion: '',
    precio: '',
    grupo_id: '',
    tipo: 'Producto',
    disponible: true,
    imagen_url: '',
    tamanos_disponibles: [],
    precios_por_tamano: {},
    ingrediente_ids: [],
    combo_items: [] // { product_id, cantidad, tamano }
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

    const { grupos, createGrupo } = useDashboardGrupos();
    const { ingredientes } = useDashboardIngredientes();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('all');
    const [filterEstado, setFilterEstado] = useState('all');
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [creatingGroup, setCreatingGroup] = useState(false);

    const stats = getStats();
    const filteredProductos = filterProductos(searchTerm, filterCategoria, filterEstado);
    
    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (showModal) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [showModal]);

    // Obtener tamaños según el tipo de producto
    const getTamanosDisponibles = () => {
        switch (formData.tipo) {
            case 'Pizza':
                return TAMANOS_PIZZA;
            case 'Bebida':
                return TAMANOS_BEBIDA;
            case 'Acompañante':
                return TAMANOS_ACOMPANANTE;
            default:
                return [];
        }
    };

    // Verificar si el tipo necesita tamaños
    const necesitaTamanos = () => {
        return ['Pizza', 'Bebida', 'Acompañante'].includes(formData.tipo);
    };

    // Verificar si el tipo necesita ingredientes
    const necesitaIngredientes = () => {
        return ['Producto', 'Pizza', 'Acompañante'].includes(formData.tipo);
    };

    // Verificar si es un combo
    const esCombo = () => {
        return formData.tipo === 'Combo';
    };

    const handleOpenModal = (producto = null) => {
        if (producto) {
        setEditingProduct(producto);
        setFormData({
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            precio: producto.precio || '',
            grupo_id: producto.grupo_id || '',
            tipo: producto.type || 'Producto',
            disponible: producto.disponible ?? true,
            imagen_url: producto.imagen_url || '',
            tamanos_disponibles: producto.tamanos_disponibles || [],
            precios_por_tamano: producto.precios_por_tamano || {},
            ingrediente_ids: producto.ingredientes?.map(i => i.id) || [],
            combo_items: producto.combo_items?.map(item => ({
                id: item.id,
                product_id: item.product_id,
                cantidad: item.cantidad,
                tamano: item.tamano || ''
            })) || []
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

    // Obtener nombre del grupo según el tipo
    const getGrupoNameForTipo = (tipo) => {
        switch (tipo) {
            case 'Pizza':
                return 'Pizzas';
            case 'Bebida':
                return 'Bebidas';
            case 'Acompañante':
                return 'Acompañantes';
            case 'Combo':
                return 'Combos';
            default:
                return null;
        }
    };

    // Buscar grupo por nombre (case-insensitive)
    const findGrupoByName = (nombre) => {
        if (!nombre) return null;
        return grupos.find(g => 
            g.nombre.toLowerCase() === nombre.toLowerCase()
        );
    };

    // Manejar cambio de tipo de producto
    const handleTipoChange = async (newTipo) => {
        let grupoId = formData.grupo_id;
        
        // Solo para tipos específicos, buscar/crear el grupo automáticamente
        if (['Pizza', 'Bebida', 'Acompañante', 'Combo'].includes(newTipo)) {
            const grupoName = getGrupoNameForTipo(newTipo);
            const existingGrupo = findGrupoByName(grupoName);
            
            if (existingGrupo) {
                // Si el grupo ya existe, seleccionarlo automáticamente
                grupoId = existingGrupo.id;
            } else {
                // Si no existe, crearlo automáticamente
                setCreatingGroup(true);
                try {
                    const result = await createGrupo({
                        nombre: grupoName,
                        descripcion: `Categoría de ${grupoName.toLowerCase()}`,
                        disponible: true
                    });

                    if (result.success) {
                        // Buscar el grupo recién creado en el estado actualizado
                        // Esperar un momento para que el estado se actualice
                        setTimeout(() => {
                            const newGrupo = grupos.find(g => g.nombre === grupoName);
                            if (newGrupo) {
                                setFormData(prev => ({
                                    ...prev,
                                    grupo_id: newGrupo.id
                                }));
                            }
                        }, 100);
                    }
                } catch (error) {
                    console.error('Error creando grupo:', error);
                } finally {
                    setCreatingGroup(false);
                }
            }
        }

        setFormData({
            ...formData,
            tipo: newTipo,
            grupo_id: grupoId,
            tamanos_disponibles: [],
            precios_por_tamano: {},
            ingrediente_ids: [],
            combo_items: []
        });
    };

    // Manejar toggle de tamaño
    const handleTamanoToggle = (tamano) => {
        const isSelected = formData.tamanos_disponibles.includes(tamano);
        const newTamanos = isSelected
            ? formData.tamanos_disponibles.filter(t => t !== tamano)
            : [...formData.tamanos_disponibles, tamano];
        
        const newPrecios = { ...formData.precios_por_tamano };
        if (!isSelected) {
            // Inicializar con el precio base si está disponible
            newPrecios[tamano] = formData.precio || '0';
        } else {
            delete newPrecios[tamano];
        }

        setFormData({
            ...formData,
            tamanos_disponibles: newTamanos,
            precios_por_tamano: newPrecios
        });
    };

    // Manejar cambio de precio por tamaño
    const handlePrecioTamanoChange = (tamano, precio) => {
        setFormData({
            ...formData,
            precios_por_tamano: {
                ...formData.precios_por_tamano,
                [tamano]: precio
            }
        });
    };

    // Manejar toggle de ingrediente
    const handleIngredienteToggle = (ingredienteId) => {
        const isSelected = formData.ingrediente_ids.includes(ingredienteId);
        const newIngredientes = isSelected
            ? formData.ingrediente_ids.filter(id => id !== ingredienteId)
            : [...formData.ingrediente_ids, ingredienteId];
        
        setFormData({
            ...formData,
            ingrediente_ids: newIngredientes
        });
    };

    // Manejar agregar item al combo
    const handleAddComboItem = () => {
        setFormData({
            ...formData,
            combo_items: [
                ...formData.combo_items,
                { product_id: '', cantidad: 1, tamano: '' }
            ]
        });
    };

    // Manejar eliminar item del combo
    const handleRemoveComboItem = (index) => {
        const newItems = [...formData.combo_items];
        const removedItem = newItems[index];
        
        // Si tiene id, marcarlo para destrucción en lugar de eliminarlo
        if (removedItem.id) {
            newItems[index] = { ...removedItem, _destroy: true };
        } else {
            newItems.splice(index, 1);
        }
        
        setFormData({
            ...formData,
            combo_items: newItems
        });
    };

    // Manejar cambio en combo item
    const handleComboItemChange = (index, field, value) => {
        const newItems = [...formData.combo_items];
        
        if (field === 'product_id') {
            // Si cambia el producto, resetear el tamaño
            newItems[index] = {
                ...newItems[index],
                product_id: value,
                tamano: ''
            };
        } else {
            newItems[index] = {
                ...newItems[index],
                [field]: field === 'cantidad' ? parseInt(value) || 1 : value
            };
        }
        
        setFormData({
            ...formData,
            combo_items: newItems
        });
    };

    // Obtener productos disponibles para combo (excluyendo combos)
    const getProductosParaCombo = () => {
        return productos.filter(p => p.type !== 'Combo');
    };

    // Obtener producto por ID
    const getProductoById = (productId) => {
        return productos.find(p => p.id === parseInt(productId));
    };

    // Verificar si un producto tiene tamaños
    const productoTieneTamanos = (productId) => {
        const producto = getProductoById(productId);
        return producto && producto.tamanos_disponibles && producto.tamanos_disponibles.length > 0;
    };

    // Obtener tamaños de un producto
    const getTamanosDeProducto = (productId) => {
        const producto = getProductoById(productId);
        return producto?.tamanos_disponibles || [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones según tipo
        if (necesitaTamanos() && formData.tamanos_disponibles.length === 0) {
            alert('Debes seleccionar al menos un tamaño');
            return;
        }

        // Validar combos
        if (esCombo()) {
            const itemsActivos = formData.combo_items.filter(item => !item._destroy);
            if (itemsActivos.length === 0) {
                alert('Un combo debe tener al menos un producto');
                return;
            }
            
            // Validar que tengan producto y cantidad
            const itemsInvalidos = itemsActivos.filter(item => 
                !item.product_id || item.cantidad < 1
            );
            
            if (itemsInvalidos.length > 0) {
                alert('Todos los productos del combo deben tener un producto seleccionado y cantidad válida');
                return;
            }

            // Validar que productos con tamaños tengan un tamaño seleccionado
            const itemsSinTamano = itemsActivos.filter(item => 
                productoTieneTamanos(item.product_id) && !item.tamano
            );
            
            if (itemsSinTamano.length > 0) {
                alert('Debes seleccionar un tamaño para todos los productos que lo requieran');
                return;
            }
        }

        // Validar que todos los tamaños tengan precio
        if (necesitaTamanos()) {
            const tamanosInvalidos = formData.tamanos_disponibles.filter(tamano => {
                const precio = formData.precios_por_tamano[tamano];
                return !precio || parseFloat(precio) <= 0;
            });

            if (tamanosInvalidos.length > 0) {
                alert(`Por favor ingresa un precio válido para: ${tamanosInvalidos.join(', ')}`);
                return;
            }
        }

        // Crear FormData para enviar archivo de imagen
        const submitData = new FormData();
        
        // Agregar campos básicos
        submitData.append('product[nombre]', formData.nombre);
        // Solo enviar descripción si no está vacía, o enviar un espacio para evitar error de validación
        submitData.append('product[descripcion]', formData.descripcion || ' ');
        submitData.append('product[precio]', formData.precio);
        submitData.append('product[grupo_id]', formData.grupo_id);
        submitData.append('product[type]', formData.tipo);
        submitData.append('product[disponible]', formData.disponible);
        
        // Agregar tamaños si el producto los necesita
        if (necesitaTamanos()) {
            formData.tamanos_disponibles.forEach(tamano => {
                submitData.append('product[tamanos_disponibles][]', tamano);
            });
            
            // Agregar precios por tamaño como hash anidado (NO usar JSON.stringify)
            Object.keys(formData.precios_por_tamano).forEach(tamano => {
                submitData.append(`product[precios_por_tamano][${tamano}]`, formData.precios_por_tamano[tamano]);
            });
        }
        
        // Agregar ingredientes si el producto los necesita
        if (necesitaIngredientes() && formData.ingrediente_ids.length > 0) {
            formData.ingrediente_ids.forEach(id => {
                submitData.append('product[ingrediente_ids][]', id);
            });
        }
        
        // Agregar combo items si es un combo
        if (esCombo() && formData.combo_items.length > 0) {
            formData.combo_items.forEach((item, index) => {
                if (item.id) {
                    submitData.append(`product[combo_items_attributes][${index}][id]`, item.id);
                }
                if (item._destroy) {
                    submitData.append(`product[combo_items_attributes][${index}][_destroy]`, 'true');
                } else {
                    submitData.append(`product[combo_items_attributes][${index}][product_id]`, item.product_id);
                    submitData.append(`product[combo_items_attributes][${index}][cantidad]`, item.cantidad);
                    if (item.tamano) {
                        submitData.append(`product[combo_items_attributes][${index}][tamano]`, item.tamano);
                    }
                }
            });
        }
        
        // Agregar imagen si hay archivo seleccionado
        if (imageFile) {
            submitData.append('product[imagen]', imageFile);
        }
        
        // Debug: Ver qué se está enviando
        console.log('=== ENVIANDO PRODUCTO ===');
        console.log('Tipo:', formData.tipo);
        console.log('Nombre:', formData.nombre);
        console.log('Grupo ID:', formData.grupo_id);
        console.log('Precio:', formData.precio);
        console.log('Tamaños:', formData.tamanos_disponibles);
        console.log('Precios por tamaño:', formData.precios_por_tamano);
        console.log('Ingredientes:', formData.ingrediente_ids);
        console.log('Combo Items:', formData.combo_items);
        
        const result = editingProduct
            ? await updateProducto(editingProduct.id, submitData)
            : await createProducto(submitData);

        if (result.success) {
            handleCloseModal();
        } else {
            console.error('Error completo del servidor:', result);
            alert(`Error al ${editingProduct ? 'actualizar' : 'crear'} producto:\n${result.error}`);
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
                <Hamburger />                Gestión de Productos
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
                <option value="Producto">Producto</option>
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
                    <label>Grupo *</label>
                    <select
                        value={formData.grupo_id}
                        onChange={(e) => setFormData({ ...formData, grupo_id: e.target.value })}
                        required
                        disabled={creatingGroup}
                    >
                        <option value="">
                            {creatingGroup ? 'Creando grupo...' : 'Seleccionar grupo'}
                        </option>
                        {grupos.map(grupo => (
                            <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
                        ))}
                    </select>
                    {creatingGroup && (
                        <small style={{ color: '#ffd700', marginTop: '0.25rem', display: 'block' }}>
                            ⏳ Creando grupo automáticamente...
                        </small>
                    )}
                    </div>

                    <div className="dashboard-form-group">
                    <label>Tipo *</label>
                    <select
                        value={formData.tipo}
                        onChange={(e) => handleTipoChange(e.target.value)}
                        required
                    >
                        <option value="Producto">Producto</option>
                        <option value="Pizza">Pizza</option>
                        <option value="Bebida">Bebida</option>
                        <option value="Acompañante">Acompañante</option>
                        <option value="Combo">Combo</option>
                    </select>
                    </div>

                    <div className="dashboard-form-group">
                    <label>Precio Base *</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                        required
                    />
                    </div>

                    <div className="dashboard-form-group full-width">
                    <ImageUpload
                        imageFile={imageFile}
                        imagePreview={imagePreview}
                        onImageChange={(file, preview) => {
                            setImageFile(file);
                            setImagePreview(preview);
                        }}
                        onImageRemove={() => {
                            setImageFile(null);
                            setImagePreview(null);
                        }}
                        label="Imagen del Producto"
                    />
                    </div>

                    <div className="dashboard-form-group full-width">
                    <label>Descripción</label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows="3"
                    />
                    </div>

                    {/* Tamaños (Pizza, Bebida, Acompañante) */}
                    {necesitaTamanos() && (
                        <div className="dashboard-form-group full-width">
                            <label>Tamaños Disponibles * <small style={{fontWeight: 'normal', color: '#888'}}>(ingresa precio para cada tamaño)</small></label>
                            <div className="tamanos-grid">
                                {getTamanosDisponibles().map(tamano => (
                                    <div 
                                        key={tamano} 
                                        className={`tamano-item ${
                                            formData.tamanos_disponibles.includes(tamano) && 
                                            (!formData.precios_por_tamano[tamano] || parseFloat(formData.precios_por_tamano[tamano]) <= 0)
                                            ? 'tamano-item-error' 
                                            : ''
                                        }`}
                                    >
                                        <label className="tamano-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.tamanos_disponibles.includes(tamano)}
                                                onChange={() => handleTamanoToggle(tamano)}
                                            />
                                            <span>{tamano}</span>
                                        </label>
                                        {formData.tamanos_disponibles.includes(tamano) && (
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                placeholder={`Precio ${tamano}`}
                                                value={formData.precios_por_tamano[tamano] || ''}
                                                onChange={(e) => handlePrecioTamanoChange(tamano, e.target.value)}
                                                required
                                                className="tamano-precio-input"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ingredientes (Producto, Pizza, Acompañante) */}
                    {necesitaIngredientes() && ingredientes.length > 0 && (
                        <div className="dashboard-form-group full-width">
                            <label>Ingredientes</label>
                            <div className="ingredientes-grid">
                                {ingredientes.map(ingrediente => (
                                    <label key={ingrediente.id} className="ingrediente-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.ingrediente_ids.includes(ingrediente.id)}
                                            onChange={() => handleIngredienteToggle(ingrediente.id)}
                                        />
                                        <span>{ingrediente.nombre}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Productos del Combo */}
                    {esCombo() && (
                        <div className="dashboard-form-group full-width">
                            <label>Productos del Combo * <small style={{fontWeight: 'normal', color: '#888'}}>(mínimo 1 producto)</small></label>
                            <div className="combo-items-container">
                                {formData.combo_items.filter(item => !item._destroy).map((item, index) => (
                                    <div key={index} className="combo-item-row-extended">
                                        <select
                                            value={item.product_id}
                                            onChange={(e) => handleComboItemChange(index, 'product_id', e.target.value)}
                                            required
                                            className="combo-item-select"
                                        >
                                            <option value="">Seleccionar producto</option>
                                            {getProductosParaCombo().map(producto => (
                                                <option key={producto.id} value={producto.id}>
                                                    {producto.nombre} ({producto.type})
                                                </option>
                                            ))}
                                        </select>
                                        
                                        {/* Selector de tamaño si el producto lo requiere */}
                                        {item.product_id && productoTieneTamanos(item.product_id) && (
                                            <select
                                                value={item.tamano || ''}
                                                onChange={(e) => handleComboItemChange(index, 'tamano', e.target.value)}
                                                required
                                                className="combo-item-tamano"
                                            >
                                                <option value="">Tamaño</option>
                                                {getTamanosDeProducto(item.product_id).map(tamano => (
                                                    <option key={tamano} value={tamano}>
                                                        {tamano}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.cantidad}
                                            onChange={(e) => handleComboItemChange(index, 'cantidad', e.target.value)}
                                            placeholder="Cant."
                                            required
                                            className="combo-item-cantidad"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveComboItem(index)}
                                            className="dashboard-btn-icon dashboard-btn-delete"
                                            title="Eliminar"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddComboItem}
                                    className="dashboard-btn-secondary"
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    <Plus size={18} style={{ marginRight: '6px' }} />
                                    Agregar Producto
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="dashboard-form-group full-width">
                    <label className="dashboard-checkbox-label" style={{display: 'flex'}}>
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
