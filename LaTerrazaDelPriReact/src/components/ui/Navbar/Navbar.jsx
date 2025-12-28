import { useState } from 'react'
import { Link } from 'react-router-dom'
import { House, Blocks, ShoppingCart, UserRoundPlus, User, LogOut, Gauge} from 'lucide-react'
import logo from '../../../assets/icons/LogoTerrazaDelPri.svg'
import useCart from '../../../hooks/useCart'
import useAuth from '../../../hooks/useAuth'
import BusquedaBar from '../buscador/BusquedaBar'
import './Navbar.css'


export default function Navbar () {
    const [open, setOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const { totalItems } = useCart()
    const { user, logout } = useAuth()
    const displayCount = totalItems > 9 ? '9+' : totalItems

    const handleLogout = () => {
        logout()
        setUserMenuOpen(false)
        setOpen(false)
    }

    return (
        <>
            <nav className='navbar'>
                <div className='navbar-container'>
                    <div className='navbar-logo'>
                        <Link to='/' className='navbar-link'>
                            <img
                                src={logo} 
                                alt="Logo La Terraza Del Pri" 
                                loading="eager"
                                fetchpriority="high"
                                width="45"
                                height="45"
                                draggable="false" 
                                onContextMenu={e => e.preventDefault()} 
                            />
                        </Link>
                        La Terraza Del Pri
                    </div>
                    
                    <BusquedaBar />
                    
                    <ul className='navbar-links'>
                        <Link to='/' className='navbar-link'>Home</Link>
                        <Link to='/categorias' className='navbar-link'>Categorias</Link>
                        <Link to='/carrito' className='navbar-link'>
                            <ShoppingCart />
                            {totalItems > 0 && <span className="cart-badge">{displayCount}</span>}
                        </Link>
                        
                        {user ? (
                            <div className='user-menu-container'>
                                <button 
                                    className='navbar-link user-button' 
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    <User /> {user.nombre}
                                </button>
                                {userMenuOpen && (
                                    <div className='user-dropdown'>
                                        {(user.rol === 'admin' || user.rol === 'empleado') ? (
                                            <>
                                                <Link to='/dashboard' onClick={() => setUserMenuOpen(false)}>
                                                    <Gauge />Dashboard
                                                </Link>
                                                <hr />
                                                <Link to='/perfil' onClick={() => setUserMenuOpen(false)}>
                                                    <User /> Mi Perfil
                                                </Link>
                                            </>
                                        ) : (
                                            <Link to='/perfil' onClick={() => setUserMenuOpen(false)}>
                                                <User /> Mi Perfil
                                            </Link>
                                        )}
                                        <hr />
                                        <button onClick={handleLogout}>
                                            <LogOut /> Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to='/login' className='navbar-link'><UserRoundPlus /></Link>
                        )}
                    </ul>

                    <button className='navbar-burger' onClick={() => setOpen(!open)}>
                        <span/>
                        <span/>
                        <span/>
                    </button>
                </div>
            </nav>

            {open && <div className="overlay" onClick={() => setOpen(false)} />}

            <aside className={`side-menu ${open ? 'open' : ''}`}>
                <header className="side-menu-header">
                    <img
                        src={logo} 
                        alt="Logo La Terraza Del Pri" 
                        loading="eager"
                        fetchpriority="high"
                    />
                    <p>La Terraza Del Pri</p>
                    <button className="close" onClick={() => setOpen(false)}>×</button>
                </header>
                
                <Link to="/" onClick={() => setOpen(false)}><House />Home</Link>
                <Link to="/categorias" onClick={() => setOpen(false)}><Blocks />Categorias</Link>
                
                <hr />

                <Link to="/carrito" onClick={() => setOpen(false)}><ShoppingCart />Carrito{totalItems > 0 && <span className="cart-badge-mobile">{displayCount}</span>}</Link>

                <hr />
                
                {user ? (
                    <>
                        <div className='user-info-mobile'>
                            <User /> {user.nombre} {user.apellido}
                        </div>
                        {(user.rol === 'admin' || user.rol === 'empleado') ? (
                            <Link to="/dashboard" onClick={() => setOpen(false)}><User />Dashboard</Link>
                        ) : (
                            <Link to="/perfil" onClick={() => setOpen(false)}><User />Mi Perfil</Link>
                        )}
                        <hr />
                        <button className='logout-mobile' onClick={handleLogout}><LogOut />Cerrar Sesión</button>
                    </>
                ) : (
                    <Link to="/login" onClick={() => setOpen(false)}><UserRoundPlus />Iniciar sesión</Link>
                )}
            </aside>
        </>
    )
}