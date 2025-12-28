import { useState } from 'react'
import { Settings, Save, Trash2 } from 'lucide-react'
import useAuth from '../../../hooks/useAuth'
import MainLayout from '../../../layouts/MainLayout'
import './Perfil.css'

export default function Configuracion () {
    // eslint-disable-next-line no-unused-vars
    const { user, logout } = useAuth()
    const [form, setForm] = useState({
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        telefono: user?.telefono || '',
        email: user?.email || ''
    })
    const [message, setMessage] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: Implementar actualización de datos
        setMessage('Funcionalidad en desarrollo')
        setTimeout(() => setMessage(null), 3000)
    }

    const handleDeleteAccount = () => {
        // TODO: Implementar eliminación de cuenta
        alert('Funcionalidad en desarrollo')
        setShowDeleteConfirm(false)
    }

    return (
        <MainLayout>
            <section className='page-content'>
                <div className='perfil-container'>
                    <div className='perfil-header'>
                        <Settings size={64} />
                        <h1>Configuración</h1>
                    </div>

                    <div className='perfil-card'>
                        <h2>Actualizar Información</h2>
                        {message && <div className='message'>{message}</div>}
                        
                        <form onSubmit={handleSubmit} className='config-form'>
                            <div className='form-group'>
                                <label>Nombre</label>
                                <input 
                                    type='text' 
                                    name='nombre' 
                                    value={form.nombre} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label>Apellido</label>
                                <input 
                                    type='text' 
                                    name='apellido' 
                                    value={form.apellido} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label>Teléfono</label>
                                <input 
                                    type='tel' 
                                    name='telefono' 
                                    value={form.telefono} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label>Email</label>
                                <input 
                                    type='email' 
                                    name='email' 
                                    value={form.email} 
                                    onChange={handleChange}
                                    disabled
                                />
                                <small>El email no se puede modificar</small>
                            </div>
                            <button type='submit' className='btn-primary'>
                                <Save /> Guardar Cambios
                            </button>
                        </form>
                    </div>

                    <div className='perfil-card danger-zone'>
                        <h2>Zona de Peligro</h2>
                        <p>Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.</p>
                        
                        {!showDeleteConfirm ? (
                            <button 
                            className='btn-danger' 
                            onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 /> Eliminar Cuenta
                            </button>
                        ) : (
                            <div className='delete-confirm'>
                                <p><strong>¿Estás seguro de que deseas eliminar tu cuenta?</strong></p>
                                <div className='confirm-buttons'>
                                    <button 
                                        className='btn-danger' 
                                        onClick={handleDeleteAccount}
                                    >
                                        Sí, eliminar mi cuenta
                                    </button>
                                    <button 
                                        className='btn-secondary' 
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </MainLayout>
    )
}
