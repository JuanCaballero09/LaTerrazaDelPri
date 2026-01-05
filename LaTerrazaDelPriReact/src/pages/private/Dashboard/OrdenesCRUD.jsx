import { useState } from 'react';
import { useDashboardOrders } from '../../../hooks/Dashboard/useDashboardOrders';
import './Dashboard.css';

export function OrdenesCRUD() {
  const {
    loading,
    updateEstado,
    filterOrdenes,
    getEstadoBadge,
    getStats
  } = useDashboardOrders();

  const [selectedOrden, setSelectedOrden] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterEstado, setFilterEstado] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = getStats();
  const filteredOrdenes = filterOrdenes(searchTerm, filterEstado);

  const handleEstadoChange = async (orden, nuevoEstado) => {
    const result = await updateEstado(orden.code, nuevoEstado);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleViewDetails = (orden) => {
    setSelectedOrden(orden);
    setShowDetailModal(true);
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
          <h1>📦 Gestión de Órdenes</h1>
          <p className="crud-subtitle">Administra todos los pedidos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="crud-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por número o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="en_preparacion">En Preparación</option>
            <option value="en_camino">En Camino</option>
            <option value="entregada">Entregada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="crud-stats">
        <div className="stat-item">
          <span className="stat-label">Total Órdenes</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pendientes</span>
          <span className="stat-value warning">{stats.pendientes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">En Proceso</span>
          <span className="stat-value info">{stats.enProceso}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Finalizadas</span>
          <span className="stat-value success">{stats.finalizadas}</span>
        </div>
      </div>

        {/* Tabla de órdenes */}
        <div className="table-container">
            <table className="crud-table">
                <thead>
                    <tr>
                    <th>Orden</th>
                    <th>Cliente</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrdenes.map(orden => (
                    <tr key={orden.id}>
                        <td>
                            <strong className="orden-numero">{orden.code}</strong>
                        </td>
                        <td>
                            <div className="cliente-info">
                                <strong>{orden.customer_name || `${orden.user?.nombre || ''} ${orden.user?.apellido || ''}`.trim() || 'Cliente'}</strong>
                                <p>{orden.customer_phone || orden.user?.telefono || 'N/A'}</p>
                            </div>
                        </td>
                        <td>
                            <span className="items-count">{orden.order_items?.length || 0} item(s)</span>
                        </td>
                        <td>
                            <strong className="orden-total">${orden.total?.toLocaleString('es-CO')}</strong>
                        </td>
                        <td>
                            <select
                                value={orden.status}
                                onChange={(e) => handleEstadoChange(orden, e.target.value)}
                                className={`estado-select ${getEstadoBadge(orden.status).class}`}
                            >
                                <option value="pendiente">Pendiente</option>
                                <option value="pagado">Pagado</option>
                                <option value="tomado">En Preparación</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </td>
                        <td>
                            <span className="fecha-text">
                                {new Date(orden.created_at).toLocaleDateString('es-CO')}
                                <br />
                                <small>{new Date(orden.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</small>
                            </span>
                        </td>
                        <td>
                            <button
                                className="dashboard-btn-icon dashboard-btn-view"
                                onClick={() => handleViewDetails(orden)}
                                title="Ver detalles"
                            >
                                👁️
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>

                {filteredOrdenes.length === 0 && (
                    <div className="dashboard-empty-state">
                        <p>No se encontraron órdenes</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedOrden && (
                <div className="dashboard-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="dashboard-modal-content orden-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dashboard-modal-header">
                            <h2>Detalle de Orden {selectedOrden.code}</h2>
                            <button className="dashboard-modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
                        </div>
                        
                        <div className="orden-detail-body">
                        {/* Cliente Info */}
                        <div className="detail-section">
                            <h3>👤 Información del Cliente</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Nombre:</span>
                                    <span className="detail-value">{selectedOrden.customer_name || `${selectedOrden.user?.nombre || ''} ${selectedOrden.user?.apellido || ''}`.trim() || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{selectedOrden.customer_email || selectedOrden.user?.email || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Teléfono:</span>
                                    <span className="detail-value">{selectedOrden.customer_phone || selectedOrden.user?.telefono || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Entrega Info */}
                        <div className="detail-section">
                            <h3>🚚 Información de Entrega</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Tipo:</span>
                                    <span className="detail-value">{selectedOrden.tipo_entrega === 'domicilio' ? 'Domicilio' : 'Recoger en sede'}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <span className="detail-label">Dirección:</span>
                                    <span className="detail-value">{selectedOrden.direccion?.direccion || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Método de Pago:</span>
                                    <span className="detail-value">{selectedOrden.metodo_pago === 'efectivo' ? 'Efectivo' : 'PSE'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="detail-section">
                            <h3>🍕 Productos</h3>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                    <th>Producto</th>
                                    <th>Cant.</th>
                                    <th>Precio</th>
                                    <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedOrden.order_items || []).map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>{item.name || item.product?.nombre || 'Producto'}</td>
                                        <td>{item.quantity}</td>
                                        <td>${parseFloat(item.price || item.unit_price || 0).toLocaleString('es-CO')}</td>
                                        <td><strong>${(parseFloat(item.price || item.unit_price || 0) * item.quantity).toLocaleString('es-CO')}</strong></td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totales */}
                        <div className="detail-section">
                            <div className="totales-grid">
                                <div className="total-row">
                                    <span>Subtotal:</span>
                                    <span>${parseFloat(selectedOrden.subtotal || selectedOrden.total).toLocaleString('es-CO')}</span>
                                </div>
                                {(selectedOrden.descuento && selectedOrden.descuento > 0) && (
                                    <div className="total-row">
                                        <span>Descuento:</span>
                                        <span className="descuento">-${parseFloat(selectedOrden.descuento).toLocaleString('es-CO')}</span>
                                    </div>
                                )}
                                <div className="total-row final">
                                    <span><strong>Total:</strong></span>
                                    <span><strong>${parseFloat(selectedOrden.total).toLocaleString('es-CO')}</strong></span>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


export default OrdenesCRUD;
