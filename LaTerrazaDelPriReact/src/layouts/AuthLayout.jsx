import logo from '../assets/icons/LogoLigth.jpg'
import './AuthLayout.css'


export default function AuthLayout ({ children }) {
    return (
        <main className="AuthLayout">
            <section className="auth-info">
                <img src={logo} alt="La Terraza del Pri Logo" loading='eager' fetchPriority='high' draggable="false" onContextMenu={e => e.preventDefault()} />
                <h1>La Terraza del Pri</h1>
                <p>Calidad por encima de todo</p>
            </section>
            <section className="auth-page-container">
                {children}
            </section>
        </main>
    )
}