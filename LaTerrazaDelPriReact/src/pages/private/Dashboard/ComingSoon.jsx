import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export function ComingSoon({ section }) {
    const navigate = useNavigate();

    const sections = {
        usuarios: {
        icon: '👥',
        title: 'Gestión de Usuarios',
        description: 'Administra todos los usuarios del sistema',
        features: [
            'Ver lista de usuarios',
            'Editar perfiles',
            'Gestionar roles y permisos',
            'Historial de actividad'
        ]
        },
        sedes: {
        icon: '🏪',
        title: 'Gestión de Sedes',
        description: 'Administra todas las sedes del negocio',
        features: [
            'Registrar nuevas sedes',
            'Actualizar información',
            'Horarios de atención',
            'Zonas de cobertura'
        ]
        },
        banners: {
        icon: '🖼️',
        title: 'Gestión de Banners',
        description: 'Administra los banners promocionales',
        features: [
            'Subir imágenes de banners',
            'Ordenar visualización',
            'Activar/desactivar banners',
            'Enlaces promocionales'
        ]
        }
    };

    const currentSection = sections[section] || sections.usuarios;

    return (
        <div className="coming-soon-container">
        <div className="coming-soon-content">
            <div className="coming-soon-icon">{currentSection.icon}</div>
            <h1 className="coming-soon-title">{currentSection.title}</h1>
            <p className="coming-soon-description">{currentSection.description}</p>
            
            <div className="coming-soon-badge">🚧 En Desarrollo</div>
            
            <div className="coming-soon-features">
            <h3>Funcionalidades Próximamente:</h3>
            <ul>
                {currentSection.features.map((feature, index) => (
                <li key={index}>
                    <span className="feature-check">✓</span> {feature}
                </li>
                ))}
            </ul>
            </div>

            <div className="coming-soon-actions">
            <button 
                className="dashboard-btn-back"
                onClick={() => navigate('/admin/dashboard')}
            >
                ← Volver al Dashboard
            </button>
            </div>
        </div>

        <div className="coming-soon-illustration">
            <div className="illustration-circle circle-1"></div>
            <div className="illustration-circle circle-2"></div>
            <div className="illustration-circle circle-3"></div>
        </div>
        </div>
    );
    }
