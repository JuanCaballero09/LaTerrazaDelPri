import { useState } from 'react'
import { Link } from 'react-router-dom'
import { House, Blocks } from 'lucide-react'

import logo from '../../../assets/icons/LogoTerrazaDelPri.svg'
import './Navbar.css'


export default function Navbar () {
    const [open, setOpen] = useState(false)

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
                <button className="close" onClick={() => setOpen(false)}>×</button>

                <Link to="/" onClick={() => setOpen(false)}><House />Home</Link>
                <Link to="/categorias" onClick={() => setOpen(false)}><Blocks />Categorias</Link>
            </aside>
        </>
    )
}