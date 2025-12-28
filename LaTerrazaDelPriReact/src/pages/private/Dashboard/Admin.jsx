import { Gauge , Users, Package, ShoppingBag, MapPin, Settings, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import MainLayout from '../../../layouts/MainLayout'
import './Dashboard.css'

export default function AdminDashboard () {
    const { user } = useAuth()

    const adminMenuItems = [
        {
            to: '/dashboard/ordenes',
            icon: <Package size={24} />,
            title: 'Gestionar Órdenes',
            description: 'Ver y administrar todas las órdenes'
        },
        {
            to: '/dashboard/productos',
            icon: <ShoppingBag size={24} />,
            title: 'Productos',
            description: 'Administrar catálogo de productos'
        },
        {
            to: '/dashboard/usuarios',
            icon: <Users size={24} />,
            title: 'Usuarios',
            description: 'Gestionar usuarios del sistema'
        },
        {
            to: '/dashboard/sedes',
            icon: <MapPin size={24} />,
            title: 'Sedes',
            description: 'Administrar sedes y ubicaciones'
        },
        {
            to: '/dashboard/configuracion',
            icon: <Settings size={24} />,
            title: 'Configuración',
            description: 'Configuración general del sistema'
        }
    ]

    return (
        <section className='page-content'>
            <div className='dashboard-container'>
                <div className='dashboard-header'>
                    <Gauge size={64 } />
                    <div>
                        <h1>Dashboard Administrativo</h1>
                        <p>Bienvenido, {user?.nombre} - {user?.rol}</p>
                    </div>
                </div>

                <div className='dashboard-stats'>
                    <div className='stat-card'>
                        <Package size={32} />
                        <div>
                            <p className='stat-value'>--</p>
                            <p className='stat-label'>Órdenes Hoy</p>
                        </div>
                    </div>
                    <div className='stat-card'>
                        <ShoppingBag size={32} />
                        <div>
                            <p className='stat-value'>--</p>
                            <p className='stat-label'>Productos</p>
                        </div>
                    </div>
                    <div className='stat-card'>
                        <Users size={32} />
                        <div>
                            <p className='stat-value'>--</p>
                            <p className='stat-label'>Usuarios</p>
                        </div>
                    </div>
                </div>

                <div className='dashboard-card'>
                    <h2>Panel de Administración</h2>
                    <div className='menu-list'>
                        {adminMenuItems.map((item) => (
                            <Link key={item.to} to={item.to} className='menu-item'>
                                <div className='menu-item-icon'>{item.icon}</div>
                                <div className='menu-item-content'>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                                <ChevronRight size={24} className='menu-item-arrow' />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </ section>
    )
}
