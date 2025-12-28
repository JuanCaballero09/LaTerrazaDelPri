import { User, Mail, Phone, Package, MapPin, Settings, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import MainLayout from '../../../layouts/MainLayout'
import './Perfil.css'

export default function Dashboard () {
    const { user } = useAuth()

    const menuItems = [
        {
            to: '/perfil/ordenes',
            icon: <Package size={24} />,
            title: 'Mis Órdenes',
            description: 'Consulta el historial de tus pedidos'
        },
        {
            to: '/perfil/direcciones',
            icon: <MapPin size={24} />,
            title: 'Mis Direcciones',
            description: 'Administra tus direcciones de entrega'
        },
        {
            to: '/perfil/configuracion',
            icon: <Settings size={24} />,
            title: 'Configuración',
            description: 'Actualiza tu información personal'
        }
    ]

    return (
        <MainLayout>
            <section className='page-content'>
                <div className='perfil-container'>
                    <div className='perfil-header'>
                        <User size={64} />
                        <h1>Mi Perfil</h1>
                    </div>

                    <div className='perfil-card'>
                        <h2>Información Personal</h2>
                        <div className='perfil-info'>
                            <div className='info-row'>
                                <User />
                                <div>
                                    <label>Nombre completo</label>
                                    <p>{user?.nombre} {user?.apellido}</p>
                                </div>
                            </div>
                            <div className='info-row'>
                                <Mail />
                                <div>
                                    <label>Email</label>
                                    <p>{user?.email}</p>
                                </div>
                            </div>
                            <div className='info-row'>
                                <Phone />
                                <div>
                                    <label>Teléfono</label>
                                    <p>{user?.telefono || 'No registrado'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='perfil-card'>
                        <h2>Gestionar mi cuenta</h2>
                        <div className='menu-list'>
                            {menuItems.map((item) => (
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
            </section>
        </MainLayout>
    )
}
