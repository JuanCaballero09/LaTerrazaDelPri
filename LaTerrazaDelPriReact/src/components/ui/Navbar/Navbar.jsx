import { useState } from 'react'
import { Link } from 'react-router-dom'
import { House, Blocks, ShoppingCart, User, LogOut, Gauge, SquareMenu, Search} from 'lucide-react'
import logo from '../../../assets/icons/LogoTerrazaDelPri.svg'
import useCart from '../../../hooks/useCart'
import useAuth from '../../../hooks/useAuth'
import BusquedaBar from '../buscador/BusquedaBar'
import './Navbar.css'


export default function Navbar () {
    const [open, setOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)

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
                    <div className='navbar-spacer'>
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
                        <ul className='navbar-links navbar-main-links'>
                            <Link to='/' className='navbar-link'>Home</Link>
                            <Link to='/menu' className='navbar-link'>Menu</Link>
                            <Link to='/categorias' className='navbar-link'>Categorias</Link>
                        </ul>

                    </div> 
                    
                    
                    <ul className='navbar-links'>
                        <button className='navbar-link' onClick={() => setSearchOpen(!searchOpen)}>
                            <Search />
                        </button>
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
                            <Link to='/login' className='navbar-link'><User /></Link>
                        )}
                    </ul>

                    <div className='navbar-mobile-actions'>
                        <button className='navbar-link-mobile' onClick={() => setSearchOpen(!searchOpen)}>
                            <Search />
                        </button>
                        <button className='navbar-burger' onClick={() => setOpen(!open)}>
                            <span/>
                            <span/>
                            <span/>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Panel de búsqueda desplegable */}
            {searchOpen && (
                <>
                    <div className="search-overlay" onClick={() => setSearchOpen(false)} />
                    <BusquedaBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
                </>
            )}

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
                <Link to="/menu" onClick={() => setOpen(false)}><SquareMenu />Menú</Link>
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
                            <>
                                <Link to="/perfil" onClick={() => setOpen(false)}><User />Mi Perfil</Link>
                                <Link to="/dashboard" onClick={() => setOpen(false)}><Gauge />Dashboard</Link>
                            </>
                        ) : (
                            <Link to="/perfil" onClick={() => setOpen(false)}><User />Mi Perfil</Link>
                        )}
                        <hr />
                        <button className='logout-mobile' onClick={handleLogout}><LogOut />Cerrar Sesión</button>
                    </>
                ) : (
                    <Link to="/login" onClick={() => setOpen(false)}><User />Iniciar sesión</Link>
                )}
            </aside>
        </>
    )
}