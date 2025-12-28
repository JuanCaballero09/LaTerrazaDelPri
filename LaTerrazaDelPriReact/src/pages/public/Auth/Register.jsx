import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import AuthLayout from '../../../layouts/AuthLayout'
import './Auth.css'

export default function Register () {
    const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '', password_confirmation: '' })
    const [error, setError] = useState(null)
    const { register, loading } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        const res = await register(form)
        if (res.success) {
            navigate('/login')
        } else {
            setError(res.error || 'Error al registrar')
        }
    }

    return (
        <AuthLayout>        
            <h2>Registro</h2>
            {error && <div className='error'>{error}</div>}
            <form onSubmit={handleSubmit} className='auth-form'>
                <label>Nombre</label>
                <input name='nombre' value={form.nombre} onChange={handleChange} required />

                <label>Apellido</label>
                <input name='apellido' value={form.apellido} onChange={handleChange} />

                <label>Teléfono</label>
                <input name='telefono' value={form.telefono} onChange={handleChange} />

                <label>Email</label>
                <input name='email' type='email' value={form.email} onChange={handleChange} required />

                <label>Contraseña</label>
                <input name='password' type='password' value={form.password} onChange={handleChange} required />

                <label>Confirmar contraseña</label>
                <input name='password_confirmation' type='password' value={form.password_confirmation} onChange={handleChange} required />

                <button type='submit' disabled={loading}>{loading ? 'Registrando...' : 'Registrarme'}</button>
            </form>

            <p>
                ¿Ya tienes cuenta?  <Link to='/login'>Inicia sesión</Link>
            </p>
        </ AuthLayout>
    )
}
