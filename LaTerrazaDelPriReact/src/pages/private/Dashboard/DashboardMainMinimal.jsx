import { useState } from 'react';
import { useDashboardStatsEnhanced } from '../../../hooks/Dashboard/useDashboardStatsEnhanced';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
    TrendingUp, 
    ShoppingBag, 
    DollarSign, 
    Users, 
    Package,
    Clock,
    Calendar
} from 'lucide-react';
import './Dashboard.css';

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export function DashboardMainMinimal() {
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

    // Configuración de gráfica de ventas (Line Chart)
    const salesChartData = {
        labels: stats.ventasPorDia?.map(d => d.fecha) || [],
        datasets: [
            {
                label: 'Ventas ($)',
                data: stats.ventasPorDia?.map(d => d.ventas) || [],
                borderColor: '#ffd700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    // Configuración de gráfica de órdenes (Bar Chart)
    const ordersChartData = {
        labels: stats.ordenesPorDia?.map(d => d.fecha) || [],
        datasets: [
            {
                label: 'Órdenes',
                data: stats.ordenesPorDia?.map(d => d.ordenes) || [],
                backgroundColor: '#10b981',
                borderRadius: 8
            }
        ]
    };

    // Configuración de gráfica de estados (Doughnut)
    const statusChartData = {
        labels: stats.ordenesPorEstado?.labels || ['Pendientes', 'Pagadas', 'Tomadas', 'Finalizadas', 'Canceladas'],
        datasets: [
            {
                data: stats.ordenesPorEstado?.data || [
                    stats.ordenesPendientes,
                    stats.ordenesPagadas,
                    stats.ordenesTomadas,
                    stats.ordenesFinalizadas,
                    stats.ordenesCanceladas
                ],
                backgroundColor: [
                    '#f59e0b',
                    '#10b981',
                    '#3b82f6',
                    '#10b981',
                    '#ef4444'
                ],
                borderWidth: 0
            }
        ]
    };

    // Configuración de gráfica de métodos de pago (Doughnut) - PSE removido
    const paymentMethodsData = {
        labels: stats.ventasPorMetodoPago?.labels || ['Tarjeta', 'Nequi', 'Efectivo'],
        datasets: [
            {
                data: stats.ventasPorMetodoPago?.data || [
                    stats.pagosTarjeta,
                    stats.pagosNequi,
                    stats.pagosEfectivo
                ],
                backgroundColor: [
                    '#3b82f6',
                    '#ec4899',
                    '#ffd700'
                ],
                borderWidth: 0
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                borderColor: '#ffd700',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                borderColor: '#ffd700',
                borderWidth: 1
            }
        },
        cutout: '70%'
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

    return (
        <div className="dashboard-minimal">
            {/* Header */}
            <div className="dashboard-header-minimal">
                <div>
                    <h1>Dashboard</h1>
                    <p className="dashboard-subtitle-minimal">Resumen de la plataforma</p>
                </div>
                <div className="period-selector-minimal">
                    <button 
                        className={`period-btn-minimal ${period === 'today' ? 'active' : ''}`}
                        onClick={() => setPeriod('today')}
                    >
                        Hoy
                    </button>
                    <button 
                        className={`period-btn-minimal ${period === 'week' ? 'active' : ''}`}
                        onClick={() => setPeriod('week')}
                    >
                        Semana
                    </button>
                    <button 
                        className={`period-btn-minimal ${period === 'month' ? 'active' : ''}`}
                        onClick={() => setPeriod('month')}
                    >
                        Mes
                    </button>
                </div>
            </div>

            {/* Stats Cards Minimalistas */}
            <div className="stats-grid-minimal">
                <div className="stat-card-minimal yellow">
                    <div className="stat-icon-minimal">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-info-minimal">
                        <p className="stat-label-minimal">Ventas del Mes</p>
                        <h3 className="stat-value-minimal">{formatCurrency(stats.ventasMes)}</h3>
                        <span className="stat-detail-minimal">
                            <Calendar size={14} />
                            Hoy: {formatCurrency(stats.ventasHoy)}
                        </span>
                    </div>
                </div>

                <div className="stat-card-minimal green">
                    <div className="stat-icon-minimal">
                        <Package size={24} />
                    </div>
                    <div className="stat-info-minimal">
                        <p className="stat-label-minimal">Órdenes del Mes</p>
                        <h3 className="stat-value-minimal">{stats.ordenesMes}</h3>
                        <span className="stat-detail-minimal">
                            <Clock size={14} />
                            Hoy: {stats.ordenesHoy}
                        </span>
                    </div>
                </div>

                <div className="stat-card-minimal blue">
                    <div className="stat-icon-minimal">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info-minimal">
                        <p className="stat-label-minimal">Ticket Promedio</p>
                        <h3 className="stat-value-minimal">{formatCurrency(stats.ticketPromedio)}</h3>
                        <span className="stat-detail-minimal">
                            {stats.ordenesPromedioDia.toFixed(1)} órdenes/día
                        </span>
                    </div>
                </div>

                <div className="stat-card-minimal orange">
                    <div className="stat-icon-minimal">
                        <Users size={24} />
                    </div>
                    <div className="stat-info-minimal">
                        <p className="stat-label-minimal">Usuarios</p>
                        <h3 className="stat-value-minimal">{stats.usuariosTotal}</h3>
                        <span className="stat-detail-minimal">
                            +{stats.usuariosNuevosMes} este mes
                        </span>
                    </div>
                </div>
            </div>

            {/* Gráficas */}
            <div className="charts-grid">
                {/* Gráfica de Ventas */}
                <div className="chart-card">
                    <h3 className="chart-title">📈 Ventas - Últimos 7 Días</h3>
                    <div className="chart-container">
                        <Line data={salesChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Gráfica de Órdenes */}
                <div className="chart-card">
                    <h3 className="chart-title">📊 Órdenes - Últimos 7 Días</h3>
                    <div className="chart-container">
                        <Bar data={ordersChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Gráfica de Estados */}
                <div className="chart-card chart-small">
                    <h3 className="chart-title">📋 Órdenes por Estado</h3>
                    <div className="chart-container-small">
                        <Doughnut data={statusChartData} options={doughnutOptions} />
                    </div>
                </div>

                {/* Gráfica de Métodos de Pago */}
                <div className="chart-card chart-small">
                    <h3 className="chart-title">💳 Métodos de Pago</h3>
                    <div className="chart-container-small">
                        <Doughnut data={paymentMethodsData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Top Productos */}
            {stats.topProductos && stats.topProductos.length > 0 && (
                <div className="top-products-minimal">
                    <h3 className="section-title-minimal">🏆 Productos Más Vendidos</h3>
                    <div className="products-list-minimal">
                        {stats.topProductos.slice(0, 5).map((product, index) => (
                            <div key={product.id || index} className="product-item-minimal">
                                <span className="product-rank-minimal">#{index + 1}</span>
                                <div className="product-info-minimal">
                                    <p className="product-name-minimal">{product.nombre}</p>
                                    <span className="product-sales-minimal">
                                        {product.cantidad_vendida} vendidos
                                    </span>
                                </div>
                                <span className="product-revenue-minimal">
                                    {formatCurrency(product.total_ingresos || 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Información del Servidor */}
            {stats.serverInfo && (
                <div className="server-info-card">
                    <h3 className="section-title-minimal">🖥️ Información del Servidor</h3>
                    <div className="server-info-grid">
                        <div className="server-info-item">
                            <span className="server-info-label">Rails</span>
                            <span className="server-info-value">{stats.serverInfo.rails_version}</span>
                        </div>
                        <div className="server-info-item">
                            <span className="server-info-label">Ruby</span>
                            <span className="server-info-value">{stats.serverInfo.ruby_version}</span>
                        </div>
                        <div className="server-info-item">
                            <span className="server-info-label">Entorno</span>
                            <span className={`server-info-badge ${stats.serverInfo.environment}`}>
                                {stats.serverInfo.environment}
                            </span>
                        </div>
                        <div className="server-info-item">
                            <span className="server-info-label">Base de Datos</span>
                            <span className="server-info-value">{stats.serverInfo.database}</span>
                        </div>
                        <div className="server-info-item">
                            <span className="server-info-label">Tiempo Activo</span>
                            <span className="server-info-value">{stats.serverInfo.uptime}</span>
                        </div>
                        <div className="server-info-item">
                            <span className="server-info-label">Zona Horaria</span>
                            <span className="server-info-value">{stats.serverInfo.timezone}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Órdenes Recientes */}
            <div className="recent-orders-minimal">
                <div className="section-header-minimal">
                    <h3 className="section-title-minimal">📋 Órdenes Recientes</h3>
                    <a href="/admin/ordenes" className="view-all-link-minimal">Ver todas →</a>
                </div>
                
                {recentOrders && recentOrders.length > 0 ? (
                    <div className="table-container-minimal">
                        <table className="table-minimal">
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
                    <div className="empty-state-minimal">
                        <ShoppingBag size={48} />
                        <p>No hay órdenes recientes</p>
                    </div>
                )}
            </div>
        </div>
    );
}
