import { useState, useEffect } from 'react';
import { useDashboardSedes } from '../../../hooks/Dashboard/useDashboardSedes';
import SedeForm from './SedeForm';
import { MapPin } from 'lucide-react';
import './Dashboard.css';

const SedesCRUD = () => {
    const { sedes, loading, error, createSede, updateSede, deleteSede, toggleActivo } = useDashboardSedes();
    const [showForm, setShowForm] = useState(false);
    const [editingSede, setEditingSede] = useState(null);
    const [filters, setFilters] = useState({ departamento: '', activo: '' });
    
    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (showForm) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [showForm]);

    // Filtrar sedes
    const filteredSedes = sedes.filter(sede => {
        if (filters.departamento && sede.departamento !== filters.departamento) return false;
        if (filters.activo !== '' && sede.activo.toString() !== filters.activo) return false;
        return true;
    });

    // Obtener departamentos únicos para el filtro
    const departamentos = [...new Set(sedes.map(sede => sede.departamento))].sort();

    const handleCreate = () => {
        setEditingSede(null);
        setShowForm(true);
    };

    const handleEdit = (sede) => {
        setEditingSede(sede);
        setShowForm(true);
    };

    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de eliminar la sede "${nombre}"?`)) return;
        
        try {
        await deleteSede(id);
        alert('Sede eliminada exitosamente');
        } catch (err) {
        alert('Error al eliminar la sede: ' + err.message);
        }
    };

    const handleToggleActivo = async (id, nombre, activo) => {
        if (!window.confirm(`¿Cambiar estado de "${nombre}" a ${activo ? 'Inactiva' : 'Activa'}?`)) return;
        
        try {
        await toggleActivo(id);
        alert('Estado actualizado exitosamente');
        } catch (err) {
        alert('Error al cambiar el estado: ' + err.message);
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingSede(null);
    };

    const handleFormSubmit = async (formData) => {
        // eslint-disable-next-line no-useless-catch
        try {
        if (editingSede) {
            await updateSede(editingSede.id, formData);
            alert('Sede actualizada exitosamente');
        } else {
            await createSede(formData);
            alert('Sede creada exitosamente');
        }
        handleFormClose();
        } catch (err) {
            throw err;
        }
    };

    if (loading && sedes.length === 0) {
        return (
        <div className="crud-loading">
            <div className="loading-spinner"></div>
            <p>Cargando sedes...</p>
        </div>
        );
    }

    return (
        <div className="crud-container">
        <div className="crud-header">
            <div className="crud-title-section">
                <h1><MapPin /> Gestión de Sedes</h1>
                <p className="crud-subtitle">Administra las ubicaciones de tus sedes</p>
            </div>
            <button className="dashboard-btn-primary" onClick={handleCreate}>
            + Nueva Sede
            </button>
        </div>

        {error && (
            <div className="error-alert">
            <strong>Error:</strong> {Array.isArray(error) ? error.join(', ') : error}
            </div>
        )}

        {/* Filtros */}
        <div className="crud-filters">
            <div className="filter-group">
            <label htmlFor="filter-departamento">Departamento:</label>
            <select
                id="filter-departamento"
                className="filter-select"
                value={filters.departamento}
                onChange={(e) => setFilters({ ...filters, departamento: e.target.value })}
            >
                <option value="">Todos</option>
                {departamentos.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
                ))}
            </select>
            </div>

            <div className="filter-group">
            <label htmlFor="filter-activo">Estado:</label>
            <select
                id="filter-activo"
                className="filter-select"
                value={filters.activo}
                onChange={(e) => setFilters({ ...filters, activo: e.target.value })}
            >
                <option value="">Todas</option>
                <option value="true">Activas</option>
                <option value="false">Inactivas</option>
            </select>
            </div>

            <div className="filter-info">
            Mostrando {filteredSedes.length} de {sedes.length} sedes
            </div>
        </div>

        {/* Lista de Sedes */}
        <div className="sedes-grid">
            {filteredSedes.length === 0 ? (
            <div className="dashboard-empty-state">
                <p>No hay sedes que mostrar</p>
            </div>
            ) : (
            filteredSedes.map(sede => (
                <div key={sede.id} className={`sede-card ${!sede.activo ? 'inactive' : ''}`}>
                <div className="sede-card-header">
                    <h3>{sede.nombre}</h3>
                    <span className={`status-badge ${sede.activo ? 'completed' : 'pendiente'}`}>
                    {sede.activo ? 'Activa' : 'Inactiva'}
                    </span>
                </div>

                <div className="sede-card-body">
                    <div className="sede-info">
                    <strong>📍 Ubicación:</strong>
                    <p>{sede.direccion}</p>
                    {sede.barrio && <p style={{color: '#666', fontSize: '0.9rem'}}>{sede.barrio}</p>}
                    <p style={{color: '#666', fontSize: '0.9rem'}}>{sede.municipio}, {sede.departamento}</p>
                    </div>

                    {sede.telefono && (
                    <div className="sede-info">
                        <strong>📞 Teléfono:</strong>
                        <p>{sede.telefono}</p>
                    </div>
                    )}

                    {sede.latitud && sede.longitud && (
                    <div className="sede-info">
                        <strong>🗺️ Coordenadas:</strong>
                        <p className="coordinates">
                        {parseFloat(sede.latitud).toFixed(6)}, {parseFloat(sede.longitud).toFixed(6)}
                        </p>
                        <a
                        href={`https://www.google.com/maps?q=${sede.latitud},${sede.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link"
                        >
                        Ver en Google Maps →
                        </a>
                    </div>
                    )}
                </div>

                <div className="sede-card-actions">
                    <button
                    className="dashboard-btn-icon dashboard-btn-edit"
                    onClick={() => handleEdit(sede)}
                    title="Editar"
                    >
                    ✏️
                    </button>
                    <button
                    className="dashboard-btn-icon"
                    style={{background: sede.activo ? 'rgba(255, 193, 7, 0.1)' : 'rgba(40, 167, 69, 0.1)', color: sede.activo ? '#ffc107' : '#28a745'}}
                    onClick={() => handleToggleActivo(sede.id, sede.nombre, sede.activo)}
                    title={sede.activo ? 'Desactivar' : 'Activar'}
                    >
                    {sede.activo ? '🔴' : '🟢'}
                    </button>
                    <button
                    className="dashboard-btn-icon dashboard-btn-delete"
                    onClick={() => handleDelete(sede.id, sede.nombre)}
                    title="Eliminar"
                    >
                    🗑️
                    </button>
                </div>
                </div>
            ))
            )}
        </div>

        {/* Modal del Formulario */}
        {showForm && (
            <div className="dashboard-modal-overlay" onClick={handleFormClose}>
            <div className="dashboard-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="dashboard-modal-header">
                <h2>{editingSede ? 'Editar Sede' : 'Nueva Sede'}</h2>
                <button className="dashboard-modal-close" onClick={handleFormClose}>×</button>
                </div>
                <SedeForm
                sede={editingSede}
                onSubmit={handleFormSubmit}
                onCancel={handleFormClose}
                />
            </div>
            </div>
        )}
        </div>
    );
};

export default SedesCRUD;
