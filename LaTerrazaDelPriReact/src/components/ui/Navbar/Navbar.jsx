import { useState } from 'react'
import { Link } from 'react-router-dom'
import { House, Blocks, ShoppingCart} from 'lucide-react'

import logo from '../../../assets/icons/LogoTerrazaDelPri.svg'
import useCart from '../../../hooks/useCart'
import './Navbar.css'


export default function Navbar () {
    const [open, setOpen] = useState(false)

        const { totalItems } = useCart()
        const displayCount = totalItems > 9 ? '9+' : totalItems

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
                            />
                        </Link>
                        La Terraza Del Pri
                    </div>

                    <ul className='navbar-links'>
                        <Link to='/' className='navbar-link'>Home</Link>
                        <Link to='/categorias' className='navbar-link'>Categorias</Link>
                            <Link to='/carrito' className='navbar-link'><ShoppingCart />{totalItems > 0 && <span className="cart-badge">{displayCount}</span>}</Link>
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
                <hr />
                <Link to="/" onClick={() => setOpen(false)}><House />Home</Link>
                <Link to="/categorias" onClick={() => setOpen(false)}><Blocks />Categorias</Link>
                <hr />
                    <Link to="/carrito" onClick={() => setOpen(false)}><ShoppingCart />Carrito{totalItems > 0 && <span className="cart-badge-mobile">{displayCount}</span>}</Link>
            </aside>
        </>
    )
}