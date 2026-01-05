import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import logo from '../assets/icons/LogoTerrazaDelPri2.svg';
import { Gauge, Package, Group, Utensils, Beef, Users, MapPinned, GalleryThumbnails, LogOut, House} from 'lucide-react';
import './DashboardLayout.css';

export function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/auth/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLinkClick = () => {
        // Cerrar sidebar solo en móvil (< 768px)
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const menuItems = [
        {
        title: 'Dashboard',
        icon: <Gauge />,
        path: '/admin/dashboard',
        roles: ['admin', 'empleado']
        },
        {
        title: 'Productos',
        icon: <Utensils />,
        path: '/admin/productos',
        roles: ['admin', 'empleado']
        },
        {
        title: 'Órdenes',
        icon: <Package />,
        path: '/admin/ordenes',
        roles: ['admin', 'empleado']
        },
        {
        title: 'Categorias',
        icon: <Group />,
        path: '/admin/grupos',
        roles: ['admin', 'empleado']
        },
        {
        title: 'Ingredientes',
        icon:  <Beef />,
        path: '/admin/ingredientes',
        roles: ['admin', 'empleado']
        },
        {
        title: 'Usuarios',
        icon: <Users />,
        path: '/admin/usuarios',
        roles: ['admin']
        },
        {
        title: 'Sedes',
        icon: <MapPinned />,
        path: '/admin/sedes',
        roles: ['admin']
        },
        {
        title: 'Banners',
        icon: <GalleryThumbnails />,
        path: '/admin/banners',
        roles: ['admin']
        }
    ];

    // Filtrar items según el rol del usuario
    const filteredMenuItems = menuItems.filter(item => 
        item.roles.includes(user?.rol?.toLowerCase() || 'empleado')
    );

    return (
        <div className="dashboard-layout">
        {/* Botón Hamburguesa para Móvil */}
        <button 
            className="mobile-menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
        >
            <span></span>
            <span></span>
            <span></span>
        </button>

        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
            <h2 className="sidebar-logo">
                {isSidebarOpen ? (<img src={logo} alt="La Terraza del Pri" className="logo-img" />) : ''}
                {isSidebarOpen ? 'La Terraza Admin' : 'LTP'}
            </h2>
            <button 
                className="sidebar-toggle"
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
            >
                {isSidebarOpen ? '◀' : '▶'}
            </button>
            </div>

            <nav className="sidebar-nav">
            <ul className="sidebar-menu">
                {filteredMenuItems.map((item) => (
                <li key={item.path}>
                    <Link
                    to={item.path}
                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                    title={!isSidebarOpen ? item.title : ''}
                    onClick={handleLinkClick}
                    >
                    <span className="sidebar-icon">{item.icon}</span>
                    {isSidebarOpen && <span className="sidebar-text">{item.title}</span>}
                    </Link>
                </li>
                ))}
            </ul>
            </nav>

            <div className="sidebar-footer">
            <div className="sidebar-user">
                <div className="user-avatar">
                {user?.nombre?.charAt(0).toUpperCase() || 'A'}
                </div>
                {isSidebarOpen && (
                <div className="user-info">
                    <p className="user-name">{user?.nombre}</p>
                    <p className="user-role">{user?.rol}</p>
                </div>
                )}
            </div>
            <button 
                className="back-btn" 
                onClick={() => navigate('/')}
                title={!isSidebarOpen ? 'Regresar al inicio' : ''}
            >
                <span className="back-icon"><House /></span>
                {isSidebarOpen && <span>Regresar</span>}
            </button>
            <button 
                className="logout-btn" 
                onClick={handleLogout}
                title={!isSidebarOpen ? 'Cerrar sesión' : ''}
            >
                <span className="logout-icon"><LogOut /></span>
                {isSidebarOpen && <span>Cerrar Sesión</span>}
            </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <div className="dashboard-content">
            <Outlet />
            </div>
        </main>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
            <div 
            className="sidebar-overlay" 
            onClick={toggleSidebar}
            aria-hidden="true"
            />
        )}
        </div>
    );
}
