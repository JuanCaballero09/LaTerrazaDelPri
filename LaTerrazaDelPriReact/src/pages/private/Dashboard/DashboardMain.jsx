import { useDashboardStats } from '../../../hooks/Dashboard/useDashboardStats';
import './Dashboard.css';

export function DashboardMain() {
  const { stats, recentOrders, loading, error, retry } = useDashboardStats();

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
        <div className="error-help">
          <h3>Pasos para solucionar:</h3>
          <ol>
            <li>Verifica que el servidor Rails esté corriendo en <code>localhost:3000</code></li>
            <li>Ejecuta: <code>rails server</code> en la terminal del backend</li>
            <li>Verifica que no haya errores en la consola del navegador (F12)</li>
            <li>Asegúrate de haber iniciado sesión correctamente</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Bienvenido al panel de administración</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card yellow">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>TOTAL VENTAS</h3>
            <p className="stat-value">${stats.totalVentas.toLocaleString('es-CO')}</p>
            <span className="stat-label">ESTE MES</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>ÓRDENES HOY</h3>
            <p className="stat-value">{stats.ordenesHoy}</p>
            <span className="stat-label">EN PROGRESO</span>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon">🍕</div>
          <div className="stat-content">
            <h3>PRODUCTOS ACTIVOS</h3>
            <p className="stat-value">{stats.productosActivos}</p>
            <span className="stat-label">EN EL MENÚ</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>USUARIOS</h3>
            <p className="stat-value">{stats.usuarios}</p>
            <span className="stat-label">REGISTRADOS</span>
          </div>
        </div>
      </div>

      {/* Órdenes Recientes */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📋 Órdenes Recientes</h2>
          <a href="/admin/ordenes" className="view-all-link">Ver todas →</a>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
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
                       `${order.user?.nombre || ''} ${order.user?.apellido || ''}`.trim() || 
                       'Cliente'}
                    </td>
                    <td><strong>${order.total?.toLocaleString('es-CO')}</strong></td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <p>No hay órdenes recientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
