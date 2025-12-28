import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import AuthLayout from '../../../layouts/AuthLayout'
import './Auth.css'

export default function Login () {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(true)
    const [error, setError] = useState(null)
    const { login, loading } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        const res = await login({ email, password, remember })
        if (res.success) {
            navigate('/')
        } else {
            setError(res.error || 'Error al iniciar sesión')
        }
    }

    return (
        <AuthLayout>        
            <h2>Iniciar sesión</h2>
            {error && <div className='error'>{error}</div>}
            <form onSubmit={handleSubmit} className='auth-form'>
                <label>Email</label>
                <input type='email' value={email} onChange={e => setEmail(e.target.value)} required />

                <label>Contraseña</label>
                <input type='password' value={password} onChange={e => setPassword(e.target.value)} required />

                <div>
                    <input type='checkbox' checked={remember} onChange={e => setRemember(e.target.checked)} /> Recuérdame
                </div>

                <button type='submit' disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
            </form>

            <p>
                <Link to='/forgot-password'>Olvidé mi contraseña</Link>
            </p>
            <hr />
            <p>
                ¿No tienes cuenta? <Link to='/register'>Regístrate</Link>
            </p>
            <p>
                {/* ¿No has recibido el correo de confirmación? <Link to='/resend-confirmation'>Reenviar correo</Link> */}
            </p>
        </ AuthLayout>
    )
}
