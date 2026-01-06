import { useState } from 'react';
import { useDashboardStatsEnhanced } from '../../../hooks/Dashboard/useDashboardStatsEnhanced';
import { 
    TrendingUp, 
    TrendingDown,
    ShoppingBag, 
    DollarSign, 
    Users, 
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    CreditCard,
    Award,
    MapPin,
    Ticket
} from 'lucide-react';
import './Dashboard.css';

export function DashboardMainEnhanced() {
    const [period, setPeriod] = useState('month');
    const { stats, recentOrders, loading, error, retry } = useDashboardStatsEnhanced(period);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'pendiente': 'pendiente',
            'pagado': 'completed',
            'tomado': 'tomado',
            'finalizado': 'completed',
            'cancelado': 'cancelled'
        };
        return statusMap[status] || 'pendiente';
    };

    const getStatusText = (status) => {
        const statusTextMap = {
            'pendiente': 'Pendiente',
            'pagado': 'Pagado',
            'tomado': 'En Preparación',
            'finalizado': 'Finalizado',
            'cancelado': 'Cancelado'
        };
        return statusTextMap[status] || status;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <div className="error-icon">⚠️</div>
                <h2>Error al cargar el dashboard</h2>
                <p className="error-message">{error}</p>
                <button className="retry-button" onClick={retry}>
                    🔄 Reintentar
                </button>
            </div>
        );
    }

    // Calcular porcentaje de crecimiento (simulado - necesitarás datos reales del backend)
    const ventasGrowth = 15.3;
    const ordenesGrowth = 8.7;

    return (
        <div className="dashboard-main">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard Administrativo</h1>
                    <p className="dashboard-subtitle">Resumen general de la plataforma</p>
                </div>
                <div className="period-selector">
                    <button 
                        className={`period-btn ${period === 'today' ? 'active' : ''}`}
                        onClick={() => setPeriod('today')}
                    >
                        Hoy
                    </button>
                    <button 
                        className={`period-btn ${period === 'week' ? 'active' : ''}`}
                        onClick={() => setPeriod('week')}
                    >
                        Semana
                    </button>
                    <button 
                        className={`period-btn ${period === 'month' ? 'active' : ''}`}
                        onClick={() => setPeriod('month')}
                    >
                        Mes
                    </button>
                </div>
            </div>

            {/* Stats Cards principales */}
            <div className="stats-grid-enhanced">
                {/* Ventas del mes */}
                <div className="stat-card-enhanced primary">
                    <div className="stat-card-header">
                        <div className="stat-icon-wrapper primary">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-trend positive">
                            <TrendingUp size={16} />
                            <span>+{ventasGrowth}%</span>
                        </div>
                    </div>
                    <div className="stat-content-enhanced">
                        <h3>Ventas del Mes</h3>
                        <p className="stat-value-enhanced">{formatCurrency(stats.ventasMes)}</p>
                        <div className="stat-details">
                            <span className="stat-detail-item">
                                <Calendar size={14} />
                                Hoy: {formatCurrency(stats.ventasHoy)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Órdenes */}
                <div className="stat-card-enhanced success">
                    <div className="stat-card-header">
                        <div className="stat-icon-wrapper success">
                            <Package size={24} />
                        </div>
                        <div className="stat-trend positive">
                            <TrendingUp size={16} />
                            <span>+{ordenesGrowth}%</span>
                        </div>
                    </div>
                    <div className="stat-content-enhanced">
                        <h3>Órdenes del Mes</h3>
                        <p className="stat-value-enhanced">{stats.ordenesMes}</p>
                        <div className="stat-details">
                            <span className="stat-detail-item">
                                <Clock size={14} />
                                Hoy: {stats.ordenesHoy}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Ticket Promedio */}
                <div className="stat-card-enhanced info">
                    <div className="stat-card-header">
                        <div className="stat-icon-wrapper info">
                            <Award size={24} />
                        </div>
                    </div>
                    <div className="stat-content-enhanced">
                        <h3>Ticket Promedio</h3>
                        <p className="stat-value-enhanced">{formatCurrency(stats.ticketPromedio)}</p>
                        <div className="stat-details">
                            <span className="stat-detail-item">
                                <ShoppingBag size={14} />
                                {stats.ordenesPromedioDia.toFixed(1)} órdenes/día
                            </span>
                        </div>
                    </div>
                </div>

                {/* Usuarios */}
                <div className="stat-card-enhanced warning">
                    <div className="stat-card-header">
                        <div className="stat-icon-wrapper warning">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="stat-content-enhanced">
                        <h3>Usuarios</h3>
                        <p className="stat-value-enhanced">{stats.usuariosTotal}</p>
                        <div className="stat-details">
                            <span className="stat-detail-item">
                                <TrendingUp size={14} />
                                +{stats.usuariosNuevosMes} este mes
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas de Órdenes por Estado */}
            <div className="dashboard-section">
                <h2>📊 Estado de Órdenes</h2>
                <div className="orders-status-grid">
                    <div className="status-card pendiente">
                        <Clock size={32} />
                        <div>
                            <p className="status-count">{stats.ordenesPendientes}</p>
                            <p className="status-label">Pendientes</p>
                        </div>
                    </div>
                    <div className="status-card pagadas">
                        <CheckCircle size={32} />
                        <div>
                            <p className="status-count">{stats.ordenesPagadas}</p>
                            <p className="status-label">Pagadas</p>
                        </div>
                    </div>
                    <div className="status-card tomadas">
                        <Package size={32} />
                        <div>
                            <p className="status-count">{stats.ordenesTomadas}</p>
                            <p className="status-label">En Preparación</p>
                        </div>
                    </div>
                    <div className="status-card finalizadas">
                        <CheckCircle size={32} />
                        <div>
                            <p className="status-count">{stats.ordenesFinalizadas}</p>
                            <p className="status-label">Finalizadas</p>
                        </div>
                    </div>
                    <div className="status-card canceladas">
                        <XCircle size={32} />
                        <div>
                            <p className="status-count">{stats.ordenesCanceladas}</p>
                            <p className="status-label">Canceladas</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid-2cols">
                {/* Métodos de Pago */}
                <div className="dashboard-section">
                    <h2>💳 Métodos de Pago</h2>
                    <div className="payment-methods-list">
                        <div className="payment-method-item">
                            <CreditCard size={20} />
                            <span className="payment-label">Tarjeta</span>
                            <span className="payment-count">{stats.pagosTarjeta}</span>
                        </div>
                        <div className="payment-method-item">
                            <CreditCard size={20} />
                            <span className="payment-label">Nequi</span>
                            <span className="payment-count">{stats.pagosNequi}</span>
                        </div>
                        <div className="payment-method-item">
                            <CreditCard size={20} />
                            <span className="payment-label">PSE</span>
                            <span className="payment-count">{stats.pagosPSE}</span>
                        </div>
                        <div className="payment-method-item">
                            <DollarSign size={20} />
                            <span className="payment-label">Efectivo</span>
                            <span className="payment-count">{stats.pagosEfectivo}</span>
                        </div>
                    </div>
                </div>

                {/* Estadísticas Adicionales */}
                <div className="dashboard-section">
                    <h2>📈 Estadísticas Adicionales</h2>
                    <div className="additional-stats">
                        <div className="additional-stat-item">
                            <ShoppingBag size={20} />
                            <div>
                                <p className="additional-stat-label">Productos Activos</p>
                                <p className="additional-stat-value">{stats.productosActivos} / {stats.totalProductos}</p>
                            </div>
                        </div>
                        <div className="additional-stat-item">
                            <MapPin size={20} />
                            <div>
                                <p className="additional-stat-label">Sedes Activas</p>
                                <p className="additional-stat-value">{stats.sedesActivas}</p>
                            </div>
                        </div>
                        <div className="additional-stat-item">
                            <Ticket size={20} />
                            <div>
                                <p className="additional-stat-label">Cupones Usados</p>
                                <p className="additional-stat-value">{stats.cuponesUsados}</p>
                            </div>
                        </div>
                        <div className="additional-stat-item">
                            <DollarSign size={20} />
                            <div>
                                <p className="additional-stat-label">Descuentos Totales</p>
                                <p className="additional-stat-value">{formatCurrency(stats.descuentoTotal)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Productos */}
            {stats.topProductos && stats.topProductos.length > 0 && (
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>🏆 Productos Más Vendidos</h2>
                    </div>
                    <div className="top-products-grid">
                        {stats.topProductos.slice(0, 5).map((product, index) => (
                            <div key={product.id || index} className="top-product-card">
                                <div className="product-rank">#{index + 1}</div>
                                <div className="product-details">
                                    <h4>{product.nombre}</h4>
                                    <p className="product-sales">
                                        {product.cantidad_vendida} vendidos
                                    </p>
                                </div>
                                <div className="product-revenue">
                                    {formatCurrency(product.total_ingresos || 0)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Órdenes Recientes */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2>📋 Órdenes Recientes</h2>
                    <a href="/admin/ordenes" className="view-all-link">Ver todas →</a>
                </div>
                
                {recentOrders && recentOrders.length > 0 ? (
                    <div className="table-container">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>{order.code}</strong></td>
                                        <td>
                                            {order.customer_name || 
                                             order.guest_nombre || 
                                             `${order.user?.nombre || ''} ${order.user?.apellido || ''}`.trim() || 
                                             'Cliente'}
                                        </td>
                                        <td><strong>{formatCurrency(order.total)}</strong></td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td>{formatDate(order.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="dashboard-empty-state">
                        <Package size={48} />
                        <p>No hay órdenes recientes</p>
                    </div>
                )}
            </div>
        </div>
    );
}
