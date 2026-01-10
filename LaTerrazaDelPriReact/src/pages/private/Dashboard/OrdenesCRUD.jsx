import { useState, useEffect } from 'react';
import { useDashboardOrders } from '../../../hooks/Dashboard/useDashboardOrders';
import { Package, MapPin, Clock, ChefHat, X, CheckCircle, Store, Bell, ReceiptText, Check, User, Phone, CreditCard, Home, Truck, DollarSign, ShoppingBag } from 'lucide-react';
import './Dashboard.css';

export function OrdenesCRUD() {
  const {
    loading,
    sedes,
    filterSede,
    setFilterSede,
    tomarOrden,
    cancelarOrden,
    finalizarOrden,
    filterOrdenes,
    getOrdenesPagadas,
    getOrdenesEnPreparacion,
    getEstadoBadge,
    getStats,
    playNotificationSound
  } = useDashboardOrders();

  const [selectedOrden, setSelectedOrden] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterEstado, setFilterEstado] = useState('pagado');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingOrder, setProcessingOrder] = useState(null);

  const stats = getStats();
  const filteredOrdenes = filterOrdenes(searchTerm, filterEstado);
  
  useEffect(() => {
    if (showDetailModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showDetailModal]);

  const handleTomarOrden = async (orden) => {
    setProcessingOrder(orden.code);
    const result = await tomarOrden(orden.code);
    setProcessingOrder(null);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleCancelarOrden = async (orden) => {
    if (window.confirm('¿Estás seguro de cancelar esta orden?')) {
      setProcessingOrder(orden.code);
      const result = await cancelarOrden(orden.code);
      setProcessingOrder(null);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleFinalizarOrden = async (orden) => {
    setProcessingOrder(orden.code);
    const result = await finalizarOrden(orden.code);
    setProcessingOrder(null);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleViewDetails = (orden) => {
    setSelectedOrden(orden);
    setShowDetailModal(true);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${Math.floor(diffHours / 24)}d`;
  };

  const handleTestSound = () => {
    playNotificationSound();
  };

  if (loading) {
    return (
      <div className="crud-loading">
        <div className="loading-spinner"></div>
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="crud-container">
      {/* Header */}
      <div className="crud-header">
        <div className="crud-title-section">
          <h1><Package size={28} /> Gestión de Órdenes</h1>
          <p className="crud-subtitle">Administra los pedidos en tiempo real</p>
        </div>
        <button className="btn-test-sound" onClick={handleTestSound} title="Probar sonido de notificación">
          <Bell size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="crud-filters">
        <div className="filter-group">
          <label><Store size={16} /> Sede:</label>
          <select
            value={filterSede}
            onChange={(e) => setFilterSede(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas las sedes</option>
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id.toString()}>{sede.nombre}</option>
            ))}
          </select>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por código o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="crud-stats">
        <div
          className={`stat-card yellow ${filterEstado === 'pagado' ? 'active' : ''}`}
          onClick={() => setFilterEstado('pagado')}
        >
          <div className="stat-icon">
            <ReceiptText size={24} />
          </div>
          <div className="stat-content">
            <h3>Por Tomar</h3>
            <p className="stat-value">{stats.pagadas || 0}</p>
          </div>
        </div>
        <div
          className={`stat-card blue ${filterEstado === 'tomado' ? 'active' : ''}`}
          onClick={() => setFilterEstado('tomado')}
        >
          <div className="stat-icon">
            <ChefHat size={24} />
          </div>
          <div className="stat-content">
            <h3>En Preparación</h3>
            <p className="stat-value">{stats.enPreparacion || 0}</p>
          </div>
        </div>
        <div
          className={`stat-card green ${filterEstado === 'finalizado' ? 'active' : ''}`}
          onClick={() => setFilterEstado('finalizado')}
        >
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Finalizadas</h3>
            <p className="stat-value">{stats.finalizadas || 0}</p>
          </div>
        </div>
        <div
          className={`stat-card orange ${filterEstado === 'all' ? 'active' : ''}`}
          onClick={() => setFilterEstado('all')}
        >
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <h3>Total</h3>
            <p className="stat-value">{stats.total || 0}</p>
          </div>
        </div>
      </div>

      {/* Orders Cards */}
      <div className="ordenes-cards-grid">
        {filteredOrdenes.length === 0 ? (
          <div className="dashboard-empty-state">
            <Package size={64} />
            <p>No hay órdenes {filterEstado !== 'all' ? 'en este estado' : 'disponibles'}</p>
          </div>
        ) : (
          filteredOrdenes.map(orden => {
            const badge = getEstadoBadge(orden.status);
            const isProcessing = processingOrder === orden.code;
            
            return (
              <div key={orden.code} className={`orden-card ${isProcessing ? 'processing' : ''}`}>
                <div className="orden-card-header">
                  <div className="orden-code">
                    <Package size={20} />
                    <strong>#{orden.code}</strong>
                  </div>
                  <div className={`status-badge ${badge.class}`}>
                    {badge.icon} {badge.label}
                  </div>
                </div>

                <div className="orden-time">
                  <Clock size={16} />
                  <span>{getTimeAgo(orden.created_at)}</span>
                </div>

                <div className="orden-client">
                  <div className="client-name">
                    <User size={16} />
                    {orden.customer_name || `${orden.user?.nombre || ''} ${orden.user?.apellido || ''}`.trim() || 'Cliente'}
                  </div>
                  {orden.customer_phone && (
                    <div className="client-phone">
                      <Phone size={16} />
                      {orden.customer_phone}
                    </div>
                  )}
                  <div className={`client-delivery ${orden.delivery_type === 'recogida' ? 'pickup' : 'delivery'}`}>
                    {orden.delivery_type === 'recogida' ? (
                      <><Home size={16} /> Recoger en sede</>
                    ) : (
                      <><Truck size={16} /> Domicilio</>
                    )}
                  </div>
                </div>

                <div className="orden-products">
                  <h4><ShoppingBag size={16} /> Productos ({orden.order_items?.length || 0})</h4>
                  <ul className="products-list">
                    {(orden.order_items || []).slice(0, 3).map((item, idx) => (
                      <li key={idx}>
                        <span className="product-qty">{item.quantity}x</span>
                        {item.product_name || item.product?.nombre || 'Producto'}
                        {item.tamano && <span className="product-size">({item.tamano})</span>}
                      </li>
                    ))}
                    {orden.order_items?.length > 3 && (
                      <li className="more-products">+{orden.order_items.length - 3} productos más</li>
                    )}
                  </ul>
                </div>

                <div className="orden-total">
                  <span><DollarSign size={18} /> Total:</span>
                  <strong>${parseFloat(orden.total).toLocaleString('es-CO')}</strong>
                </div>

                <div className="orden-card-actions">
                  <button 
                    className="btn-view"
                    onClick={() => handleViewDetails(orden)}
                  >
                    <Package size={16} /> Ver Detalles
                  </button>
                  
                  {orden.status === 'pagado' && (
                    <button 
                      className="btn-tomar"
                      onClick={() => handleTomarOrden(orden)}
                      disabled={isProcessing}
                    >
                      <ChefHat size={16} /> {isProcessing ? 'Procesando...' : 'Tomar'}
                    </button>
                  )}
                  
                  {orden.status === 'tomado' && (
                    <button 
                      className="btn-finalizar"
                      onClick={() => handleFinalizarOrden(orden)}
                      disabled={isProcessing}
                    >
                      <CheckCircle size={16} /> {isProcessing ? 'Procesando...' : 'Finalizar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showDetailModal && selectedOrden && (
        <div className="dashboard-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="dashboard-modal-content orden-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h2>Detalle de Orden {selectedOrden.code}</h2>
              <button className="dashboard-modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            
            <div className="orden-detail-body">
              <div className="detail-section">
                <div className={`status-badge ${getEstadoBadge(selectedOrden.status).class}`}>
                  {getEstadoBadge(selectedOrden.status).icon} {getEstadoBadge(selectedOrden.status).label}
                </div>
              </div>

              <div className="detail-section">
                <h3>👤 Información del Cliente</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Nombre:</span>
                    <span className="detail-value">{selectedOrden.customer_name || `${selectedOrden.user?.nombre || ''} ${selectedOrden.user?.apellido || ''}`.trim() || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Teléfono:</span>
                    <span className="detail-value">{selectedOrden.customer_phone || selectedOrden.user?.telefono || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>🚚 Información de Entrega</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tipo:</span>
                    <span className="detail-value">
                      {selectedOrden.delivery_type === 'recogida' ? '🏪 Recoger en sede' : '🛵 Domicilio'}
                    </span>
                  </div>
                  {selectedOrden.delivery_type === 'domicilio' && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Dirección:</span>
                      <span className="detail-value">{selectedOrden.direccion || 'N/A'}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Método de Pago:</span>
                    <span className="detail-value">
                      {selectedOrden.payment_method === 'card'
                        ? (selectedOrden.payment_type_card === 'debit' ? '<CreditCard /> Tarjeta Débito' : '<CreditCard /> Tarjeta Crédito')
                        : selectedOrden.payment_method === 'nequi' 
                          ? '📱 Nequi'
                          : selectedOrden.payment_method === 'cash'
                            ? '💵  Efectivo'
                            : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Productos</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Tamaño</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrden.order_items || []).map((item, index) => (
                      <tr key={item.id || index}>
                        <td>
                          <strong>{item.product_name || item.product?.nombre || 'Producto'}</strong>
                          <br/>
                          <small className="product-type">{item.product?.type || ''}</small>
                        </td>
                        <td className="center">{item.quantity}</td>
                        <td className="center">{item.tamano || '-'}</td>
                        <td className="right"><strong>${(parseFloat(item.price || item.unit_price || 0) * item.quantity).toLocaleString('es-CO')} COP</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="detail-section totals">
                <div className="totales-grid">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>${parseFloat(selectedOrden.subtotal || selectedOrden.total).toLocaleString('es-CO')} COP</span>
                  </div>
                  {selectedOrden.costo_domicilio > 0 && (
                    <div className="total-row">
                      <span>Domicilio:</span>
                      <span>${parseFloat(selectedOrden.costo_domicilio).toLocaleString('es-CO')} COP</span>
                    </div>
                  )}
                  {(selectedOrden.descuento && selectedOrden.descuento > 0) && (
                    <div className="total-row">
                      <span>Descuento:</span>
                      <span className="descuento">-${parseFloat(selectedOrden.descuento).toLocaleString('es-CO')} COP</span>
                    </div>
                  )}
                  <div className="total-row final">
                    <span><strong>Total:</strong></span>
                    <span><strong>${parseFloat(selectedOrden.total).toLocaleString('es-CO')} COP</strong></span>
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                {selectedOrden.status === 'pagado' && (
                  <button 
                    className="btn-tomar-large"
                    onClick={() => {
                      handleTomarOrden(selectedOrden);
                      setShowDetailModal(false);
                    }}
                  >
                    <ChefHat size={20} /> Tomar Orden
                  </button>
                )}
                {selectedOrden.status === 'tomado' && (
                  <button 
                    className="btn-finalizar-large"
                    onClick={() => {
                      handleFinalizarOrden(selectedOrden);
                      setShowDetailModal(false);
                    }}
                  >
                    <CheckCircle size={20} /> Marcar como Finalizada
                  </button>
                )}
                {(selectedOrden.status === 'pagado' || selectedOrden.status === 'tomado') && (
                  <button 
                    className="btn-cancelar-large"
                    onClick={() => {
                      handleCancelarOrden(selectedOrden);
                      setShowDetailModal(false);
                    }}
                  >
                    <X size={20} /> Cancelar Orden
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdenesCRUD;
