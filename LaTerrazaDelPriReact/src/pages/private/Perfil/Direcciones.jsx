import { useState } from 'react'
import { MapPin, Plus, Home, Star, Edit2, Trash2 } from 'lucide-react'
import MainLayout from '../../../layouts/MainLayout'
import useAuth from '../../../hooks/useAuth'
import useUserAddresses from '../../../hooks/useUserAddresses'
import AddressModal from '../../../components/ui/AddressModal/AddressModal'
import useCart from '../../../hooks/useCart'
import { createAddress, updateAddress, deleteAddress } from '../../../api/users.api'
import './Perfil.css'

export default function Direcciones () {
    const { user } = useAuth()
    const { addresses, loading, error, refetch } = useUserAddresses(user?.id)
    const { showToast } = useCart()
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const handleOpenModal = (address = null) => {
        setEditingAddress(address)
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        if (!isSubmitting) {
            setModalOpen(false)
            setEditingAddress(null)
        }
    }

    const handleSaveAddress = async (addressData) => {
        setIsSubmitting(true)
        try {
            if (editingAddress) {
                // Actualizar dirección existente
                await updateAddress(user.id, editingAddress.id, addressData)
                showToast('Dirección actualizada exitosamente', 'success')
            } else {
                // Crear nueva dirección
                await createAddress(user.id, addressData)
                showToast('Dirección agregada exitosamente', 'success')
            }
            
            refetch()
            handleCloseModal()
        } catch (err) {
            console.error('Error saving address:', err)
            const errorMessage = err.response?.data?.error || 
                                err.response?.data?.message || 
                                'Error al guardar la dirección'
            showToast(errorMessage, 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteAddress = async (addressId, addressName) => {
        if (deletingId) return // Prevenir múltiples clics

        const confirmed = window.confirm(
            `¿Estás seguro de eliminar la dirección "${addressName}"?\nEsta acción no se puede deshacer.`
        )

        if (!confirmed) return

        setDeletingId(addressId)
        try {
            await deleteAddress(user.id, addressId)
            showToast('Dirección eliminada exitosamente', 'success')
            refetch()
        } catch (err) {
            console.error('Error deleting address:', err)
            const errorMessage = err.response?.data?.error || 
                                err.response?.data?.message || 
                                'Error al eliminar la dirección'
            showToast(errorMessage, 'error')
        } finally {
            setDeletingId(null)
        }
    }

    const renderAddressCard = (address) => (
        <div key={address.id} className='address-card'>
            <div className='address-header'>
                <div className='address-title'>
                    <Home size={20} />
                    <h3>{address.nombre}</h3>
                </div>
                {address.principal && (
                    <span className='address-badge'>
                        <Star size={14} /> Principal
                    </span>
                )}
            </div>
            <div className='address-details'>
                <p className='address-main'>{address.direccion_completa}</p>
                <p className='address-secondary'>
                    {address.barrio && `${address.barrio}, `}
                    {address.ciudad}
                    {address.departamento && `, ${address.departamento}`}
                </p>
                {address.codigo_postal && (
                    <p className='address-secondary'>Código Postal: {address.codigo_postal}</p>
                )}
            </div>
            <div className='address-actions'>
                <button 
                    className='btn-edit'
                    onClick={() => handleOpenModal(address)}
                    title='Editar dirección'
                >
                    <Edit2 size={16} />
                    Editar
                </button>
                <button 
                    className='btn-delete'
                    onClick={() => handleDeleteAddress(address.id, address.nombre)}
                    disabled={deletingId === address.id}
                    title='Eliminar dirección'
                >
                    <Trash2 size={16} />
                    {deletingId === address.id ? 'Eliminando...' : 'Eliminar'}
                </button>
            </div>
        </div>
    )

    return (
        <MainLayout>
            <section className='page-content'>
                <div className='perfil-container'>
                    <div className='perfil-header'>
                        <MapPin size={64} />
                        <h1>Mis Direcciones</h1>
                    </div>

                    <div className='perfil-card'>
                        <div className='perfil-card-header'>
                            <p className='perfil-card-description'>
                                Gestiona tus direcciones de envío para realizar pedidos más rápidamente
                            </p>
                            <button 
                                className='btn-add-address'
                                onClick={() => handleOpenModal()}
                            >
                                <Plus size={20} />
                                Agregar Dirección
                            </button>
                        </div>

                        {loading ? (
                            <p className='loading-message'>Cargando direcciones...</p>
                        ) : error ? (
                            <div className='error-message'>
                                <p>{error}</p>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className='empty-state-container'>
                                <MapPin size={48} strokeWidth={1.5} />
                                <p className='empty-state'>No tienes direcciones guardadas</p>
                                <p className='empty-state-hint'>
                                    Agrega tu primera dirección para realizar pedidos más fácilmente
                                </p>
                                <button 
                                    className='btn-add-address-primary'
                                    onClick={() => handleOpenModal()}
                                >
                                    <Plus size={20} />
                                    Agregar Primera Dirección
                                </button>
                            </div>
                        ) : (
                            <div className='addresses-grid'>
                                {addresses.map(renderAddressCard)}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <AddressModal 
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveAddress}
                initialData={editingAddress}
                isLoading={isSubmitting}
            />
        </MainLayout>
    )
}
