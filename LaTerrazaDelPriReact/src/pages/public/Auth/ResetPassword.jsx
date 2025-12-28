import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import AuthLayout from '../../../layouts/AuthLayout'
import './Auth.css'

export default function ResetPassword () {
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)
    const { resetPassword } = useAuth()
    const navigate = useNavigate()
    const { search } = useLocation()
    const [token, setToken] = useState('')

    useEffect(() => {
        const params = new URLSearchParams(search)
        const t = params.get('reset_password_token')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (t) setToken(t)
    }, [search])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        
        const res = await resetPassword({ reset_password_token: token, password, password_confirmation: passwordConfirmation })

        if (res.success) {
            setMessage(res.data.message || 'Contraseña restablecida')
            setTimeout(() => navigate('/login'), 1500)
        } else {
            setError(res.error || 'Error')
        }
    }

    return (
        <AuthLayout>
            <h2>Restablecer contraseña</h2>
            {message && <div className='success'>{message}</div>}
            {error && <div className='error'>{error}</div>}
            <form onSubmit={handleSubmit} className='auth-form'>
                <label>Nueva contraseña</label>
                <input type='password' value={password} onChange={e => setPassword(e.target.value)} required />
                <label>Confirmar contraseña</label>
                <input type='password' value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required />
                <button type='submit'>Restablecer</button>
            </form>
        </ AuthLayout>
    )
}
