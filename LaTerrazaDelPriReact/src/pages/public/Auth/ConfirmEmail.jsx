import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import AuthLayout from '../../../layouts/AuthLayout'
import './Auth.css'

export default function ConfirmEmail () {
    const { search } = useLocation()
    const navigate = useNavigate()
    const { confirmEmail } = useAuth()
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const params = new URLSearchParams(search)
        const token = params.get('confirmation_token')
        if (!token) {
            setError('Token de confirmación no válido')
            return
        }

        ;(async () => {
            const res = await confirmEmail(token)
            if (res.success) {
                setMessage(res.data.message || 'Cuenta confirmada')
                setTimeout(() => navigate('/login'), 1500)
            } else {
                setError(res.error || 'Error al confirmar')
            }
        })()
        
    }, [search, confirmEmail, navigate])
    return (
        <AuthLayout>
            <h2>Confirmar correo</h2>
            {message && <div className='success'>{message}</div>}
            {error && <div className='error'>{error}</div>}
        </AuthLayout>
    )
}
