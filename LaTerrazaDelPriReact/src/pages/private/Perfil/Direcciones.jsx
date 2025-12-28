import { MapPin, Plus } from 'lucide-react'
import MainLayout from '../../../layouts/MainLayout'
import './Perfil.css'

export default function Direcciones () {
    return (
        <MainLayout>
            <section className='page-content'>
                <div className='perfil-container'>
                    <div className='perfil-header'>
                        <MapPin size={64} />
                        <h1>Mis Direcciones</h1>
                    </div>

                    <div className='perfil-card'>
                        <p className='empty-state'>No tienes direcciones guardadas</p>
                        <p className='empty-state-hint'>Agrega una dirección para hacer tus pedidos más rápidos</p>
                        <button className='btn-primary'>
                            <Plus /> Agregar Dirección
                        </button>
                    </div>
                </div>
            </section>
        </MainLayout>
    )
}
