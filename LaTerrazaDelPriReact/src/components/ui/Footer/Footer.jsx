
import './Footer.css'
import logo from '../../../assets/icons/LogoTerrazaDelPri.svg'
import logoBitevia from '../../../assets/icons/LogoLogoAPP.svg'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react';

export default function Footer () {
    return (
        <footer className="footer">
            <div className='footer-content'>

                <section className='footer-section footer-logo'>
                    <img src={logo} alt="Logo La Terraza Del Pri" />
                    <h3>La Terraza Del Pri</h3>
                    <p>Calidad por encima de todo</p>
                </section>
                <section className='footer-section footer-contact'>
                    <h4>Contactanos</h4>
                    <li><strong>Teléfono:</strong> +57 300 123 4567</li>
                    <li><strong>Email:</strong> contacto@laterraza.com</li>
                    <li><strong>Ubicación:</strong> Calle 123, Ciudad, País</li>
                    <li><strong>Horario:</strong> Martes a Domingos, 6pm - 12am</li>
                </section>
                <section className='footer-section footer-links'>
                    <h4>Información</h4>
                    <li><Link to="/privacy">Politicas de Privacidad</Link></li>
                    <li><Link to="/terms">Términos y Condiciones</Link></li>
                    <li><Link to="/about">Sobre nosotros</Link></li>
                    <li><Link to="/careers">Trabaja con nosotros</Link></li>
                </section>
            </div>
            <hr />
            <div className='footer-bottom'>
                <p className='footer-copyright'>© 2024 La Terraza del Pri. Todos los derechos reservados.</p>
                <section className='footer-credit'>
                    <p>powered by</p>
                    <img src={logoBitevia} alt="Logo Bitevia" />
                    <p><strong>Bitevia</strong> con <Heart color="var(--primary-color)" strokeWidth={2} /></p>
                </section>
            </div>
        </footer>
    )
}