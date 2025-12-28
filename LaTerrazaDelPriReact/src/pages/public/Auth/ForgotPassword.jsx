import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import AuthLayout from '../../../layouts/AuthLayout'
import './Auth.css'

export default function ForgotPassword () {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)
    const { forgotPassword } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        const res = await forgotPassword(email)
        if (res.success) setMessage(res.data.message || 'Revisa tu correo para instrucciones')
        else setError(res.error || 'Error')
    }

    return (
        <AuthLayout>        
            <h2>Recuperar contraseña</h2>
            {message && <div className='success'>{message}</div>}
            {error && <div className='error'>{error}</div>}
            <form onSubmit={handleSubmit} className='auth-form'>
                <label>Email</label>
                <input type='email' value={email} onChange={e => setEmail(e.target.value)} required />
                <button type='submit'>Enviar instrucciones</button>
            </form>
            <Link to='/login' className='auth-return'>Volver al inicio de sesión</Link>
        </ AuthLayout>
    )
}
