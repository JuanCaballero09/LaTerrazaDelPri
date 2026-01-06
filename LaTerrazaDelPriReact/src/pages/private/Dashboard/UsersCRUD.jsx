import { useState } from 'react';
import { useDashboardUsers } from '../../../hooks/Dashboard/useDashboardUsers';
import { 
    Users as UsersIcon, 
    Search, 
    Shield, 
    UserCheck, 
    UserX,
    Mail,
    Phone,
    Calendar,
    ShoppingBag
} from 'lucide-react';
import './Dashboard.css';

export function UsersCRUD() {
    const {
        // eslint-disable-next-line no-unused-vars
        users,
        loading,
        error,
        toggleActivo,
        changeRol,
        filterUsers,
        getStats
    } = useDashboardUsers();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRol, setFilterRol] = useState('all');
    const [filterActivo, setFilterActivo] = useState('all');

    const stats = getStats();
    const filteredUsers = filterUsers(searchTerm, filterRol, filterActivo);

    const handleToggleActivo = async (userId, userName, activo) => {
        const action = activo ? 'desactivar' : 'activar';
        if (!window.confirm(`¿Estás seguro de ${action} al usuario "${userName}"?`)) return;

        const result = await toggleActivo(userId);
        if (result.success) {
            alert(`Usuario ${activo ? 'desactivado' : 'activado'} exitosamente`);
        } else {
            alert(result.error);
        }
    };

    const handleChangeRol = async (userId, currentRol) => {
        const roles = ['cliente', 'empleado', 'admin', 'domiciliario'];
        const rolesText = roles.map((r, i) => `${i + 1}. ${r.charAt(0).toUpperCase() + r.slice(1)}`).join('\n');
        const input = prompt(`Rol actual: ${currentRol}\n\nSelecciona el nuevo rol (1-4):\n${rolesText}`);
        
        if (!input) return;
        const index = parseInt(input) - 1;
        if (index < 0 || index >= roles.length) {
            alert('Opción inválida');
            return;
        }
        
        const newRol = roles[index];
        if (newRol === currentRol) {
            alert('El usuario ya tiene ese rol');
            return;
        }

        const result = await changeRol(userId, newRol);
        if (result.success) {
            alert('Rol actualizado exitosamente');
        } else {
            alert(result.error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="crud-loading">
                <div className="loading-spinner"></div>
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <div className="error-icon">⚠️</div>
                <h2>Error al cargar usuarios</h2>
                <p className="error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="crud-container">
            {/* Header */}
            <div className="crud-header">
                <div className="crud-title-section">
                    <h1>
                        <UsersIcon 
                            size={28} 
                            style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} 
                        /> 
                        Gestión de Usuarios
                    </h1>
                    <p className="crud-subtitle">Administra los usuarios y sus roles</p>
                </div>
            </div>

            {/* Filters */}
            <div className="crud-filters">
                <div className="search-box">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={filterRol}
                        onChange={(e) => setFilterRol(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todos los roles</option>
                        <option value="admin">Administradores</option>
                        <option value="empleado">Empleados</option>
                        <option value="domiciliario">Domiciliarios</option>
                        <option value="cliente">Clientes</option>
                    </select>
                    <select
                        value={filterActivo}
                        onChange={(e) => setFilterActivo(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="crud-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Usuarios</span>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Activos</span>
                    <span className="stat-value success">{stats.activos}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Inactivos</span>
                    <span className="stat-value danger">{stats.inactivos}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Administradores</span>
                    <span className="stat-value info">{stats.admins}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Empleados</span>
                    <span className="stat-value">{stats.empleados}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Domiciliarios</span>
                    <span className="stat-value warning">{stats.domiciliarios}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Clientes</span>
                    <span className="stat-value">{stats.clientes}</span>
                </div>
            </div>

            {/* Users Table */}
            <div className="crud-table-container">
                <table className="crud-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Contacto</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Registro</th>
                            <th>Órdenes</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <strong>#{user.id}</strong>
                                </td>
                                <td>
                                    <div className="product-info">
                                        <strong>{user.nombre || 'Sin nombre'}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {user.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                <Mail size={14} style={{ color: '#666' }} />
                                                <span>{user.email}</span>
                                            </div>
                                        )}
                                        {user.telefono && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                <Phone size={14} style={{ color: '#666' }} />
                                                <span>{user.telefono}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleChangeRol(user.id, user.rol)}
                                        className={`status-badge ${
                                            user.rol === 'admin' ? 'completed' : 
                                            user.rol === 'empleado' ? 'tomado' :
                                            user.rol === 'domiciliario' ? 'in-progress' :
                                            'pendiente'
                                        }`}
                                        style={{ 
                                            cursor: 'pointer', 
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                        title="Cambiar rol"
                                    >
                                        <Shield size={14} />
                                        {user.rol === 'admin' ? 'Admin' : 
                                         user.rol === 'empleado' ? 'Empleado' :
                                         user.rol === 'domiciliario' ? 'Domiciliario' :
                                         'Cliente'}
                                    </button>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={user.activo}
                                                onChange={() => handleToggleActivo(user.id, user.nombre, user.activo)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <span className={`status-text ${user.activo ? 'available' : 'unavailable'}`}>
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <Calendar size={14} style={{ color: '#666' }} />
                                        <span>{formatDate(user.created_at)}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ShoppingBag size={16} style={{ color: '#666' }} />
                                        <span className="items-count">
                                            {user.orders_count || 0}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className={`dashboard-btn-icon ${user.activo ? 'dashboard-btn-delete' : 'dashboard-btn-edit'}`}
                                            onClick={() => handleToggleActivo(user.id, user.nombre, user.activo)}
                                            title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                        >
                                            {user.activo ? <UserX size={18} /> : <UserCheck size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="dashboard-empty-state">
                    <UsersIcon size={64} />
                    <p>No se encontraron usuarios</p>
                </div>
            )}
        </div>
    );
}
