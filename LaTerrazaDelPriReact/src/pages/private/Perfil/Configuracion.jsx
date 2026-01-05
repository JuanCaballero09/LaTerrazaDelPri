import { useState, useEffect } from 'react'
import { Settings, Save, Lock, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import useUserUpdate from '../../../hooks/useUserUpdate'
import useCart from '../../../hooks/useCart'
import { deleteUser } from '../../../api/users.api'
import MainLayout from '../../../layouts/MainLayout'
import './Perfil.css'

export default function Configuracion () {
    const { user, logout, setUser } = useAuth()
    const navigate = useNavigate()
    const { updateUserData } = useUserUpdate()
    const { showToast } = useCart()
    
    // Formulario de información personal
    const [infoForm, setInfoForm] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        email: ''
    })
    
    // Formulario de contraseña
    const [passwordForm, setPasswordForm] = useState({
        password: '',
        password_confirmation: ''
    })
    
    const [infoLoading, setInfoLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setInfoForm({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                telefono: user.telefono || '',
                email: user.email || ''
            })
        }
    }, [user])

    const handleInfoChange = (e) => {
        setInfoForm({ ...infoForm, [e.target.name]: e.target.value })
    }

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
    }

    const handleInfoSubmit = async (e) => {
        e.preventDefault()
        
        try {
            setInfoLoading(true)
            const userData = {
                nombre: infoForm.nombre,
                apellido: infoForm.apellido,
                telefono: infoForm.telefono
            }

            console.log('Actualizando usuario:', user.id, 'con datos:', userData)
            const updatedUser = await updateUserData(user.id, userData)
            console.log('Usuario actualizado:', updatedUser)
            setUser(updatedUser)
            showToast('Información actualizada correctamente', 3000)
        } catch (err) {
            console.error('Error completo:', err)
            console.error('Respuesta del servidor:', err.response)
            const errorMessage = err.response?.data?.errors 
                ? err.response.data.errors.join(', ')
                : err.response?.data?.error || 'Error al actualizar la información'
            showToast(errorMessage, 4000)
        } finally {
            setInfoLoading(false)
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        
        if (passwordForm.password !== passwordForm.password_confirmation) {
            showToast('Las contraseñas no coinciden. Por favor verifica que ambas sean iguales.', 4000)
            return
        }
        
        if (passwordForm.password.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres.', 3000)
            return
        }

        try {
            setPasswordLoading(true)
            const userData = {
                nombre: infoForm.nombre,
                apellido: infoForm.apellido,
                telefono: infoForm.telefono,
                password: passwordForm.password,
                password_confirmation: passwordForm.password_confirmation
            }

            const updatedUser = await updateUserData(user.id, userData)
            setUser(updatedUser)
            
            // Limpiar campos de contraseña
            setPasswordForm({
                password: '',
                password_confirmation: ''
            })
            
            showToast('Contraseña actualizada correctamente', 3000)
        } catch (err) {
            console.error('Error updating password:', err)
            const errorMessage = err.response?.data?.errors 
                ? err.response.data.errors.join(', ')
                : err.response?.data?.error || 'Error al actualizar la contraseña'
            showToast(errorMessage, 4000)
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            setDeleteLoading(true)
            await deleteUser(user.id)
            showToast('Cuenta eliminada exitosamente', 2000)
            setTimeout(() => {
                logout()
                navigate('/')
            }, 2000)
        } catch (err) {
            console.error('Error deleting account:', err)
            const errorMessage = err.response?.data?.error || 'Error al eliminar la cuenta'
            showToast(`${errorMessage}. Por favor intenta de nuevo.`, 4000)
            setDeleteLoading(false)
            setShowDeleteConfirm(false)
        }
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
                        <h2>Información Personal</h2>
                        <p className='section-description'>Actualiza tus datos personales</p>
                        
                        <form onSubmit={handleInfoSubmit} className='config-form'>
                            <div className='form-group'>
                                <label>Nombre</label>
                                <input 
                                    type='text' 
                                    name='nombre' 
                                    value={infoForm.nombre} 
                                    onChange={handleInfoChange}
                                    required
                                />
                            </div>
                            <div className='form-group'>
                                <label>Apellido</label>
                                <input 
                                    type='text' 
                                    name='apellido' 
                                    value={infoForm.apellido} 
                                    onChange={handleInfoChange}
                                    required
                                />
                            </div>
                            <div className='form-group'>
                                <label>Teléfono</label>
                                <input 
                                    type='tel' 
                                    name='telefono' 
                                    value={infoForm.telefono} 
                                    onChange={handleInfoChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label>Email</label>
                                <input 
                                    type='email' 
                                    name='email' 
                                    value={infoForm.email} 
                                    disabled
                                />
                                <small>El email no se puede modificar</small>
                            </div>
                            
                            <button type='submit' className='btn-primary' disabled={infoLoading}>
                                <Save /> {infoLoading ? 'Guardando...' : 'Guardar Información'}
                            </button>
                        </form>
                    </div>

                    <div className='perfil-card'>
                        <h2>Cambiar Contraseña</h2>
                        <p className='section-description'>Actualiza tu contraseña de acceso</p>
                        
                        <form onSubmit={handlePasswordSubmit} className='config-form'>
                            <div className='form-group'>
                                <label>Nueva Contraseña</label>
                                <input 
                                    type='password' 
                                    name='password' 
                                    value={passwordForm.password} 
                                    onChange={handlePasswordChange}
                                    placeholder='Ingresa tu nueva contraseña'
                                    minLength={6}
                                    required
                                />
                                <small>Mínimo 6 caracteres</small>
                            </div>
                            <div className='form-group'>
                                <label>Confirmar Nueva Contraseña</label>
                                <input 
                                    type='password' 
                                    name='password_confirmation' 
                                    value={passwordForm.password_confirmation} 
                                    onChange={handlePasswordChange}
                                    placeholder='Confirma tu nueva contraseña'
                                    required
                                />
                            </div>
                            
                            <button type='submit' className='btn-primary' disabled={passwordLoading}>
                                <Lock /> {passwordLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    </div>

                    <div className='perfil-card danger-zone'>
                        <h2>Eliminar Cuenta</h2>
                        <p className='section-description'>
                            Una vez que elimines tu cuenta, no hay vuelta atrás. 
                            Se perderán todos tus datos, órdenes y direcciones guardadas.
                        </p>
                        
                        {!showDeleteConfirm ? (
                            <button 
                                className='btn-danger' 
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={deleteLoading}
                            >
                                <Trash2 /> Eliminar Cuenta
                            </button>
                        ) : (
                            <div className='delete-confirm'>
                                <p className='confirm-title'>¿Estás seguro de que deseas eliminar tu cuenta?</p>
                                <p className='warning-text'>
                                    Esta acción es permanente y no se puede deshacer. 
                                    Todos tus datos serán eliminados de forma definitiva.
                                </p>
                                <div className='confirm-buttons'>
                                    <button 
                                        className='btn-danger' 
                                        onClick={handleDeleteAccount}
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
                                    </button>
                                    <button 
                                        className='btn-secondary' 
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={deleteLoading}
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
