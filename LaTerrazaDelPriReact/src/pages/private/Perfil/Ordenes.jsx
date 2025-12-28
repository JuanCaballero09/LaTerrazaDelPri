import { Package } from 'lucide-react'
import MainLayout from '../../../layouts/MainLayout'
import './Perfil.css'

export default function Ordenes () {
    return (
        <MainLayout>
            <section className='page-content'>    
                <div className='perfil-container'>
                    <div className='perfil-header'>
                        <Package size={64} />
                        <h1>Mis Órdenes</h1>
                    </div>

                    <div className='perfil-card'>
                        <p className='empty-state'>Aún no tienes órdenes realizadas</p>
                        <p className='empty-state-hint'>Cuando realices un pedido, aparecerá aquí</p>
                    </div>
                </div>
            </section>
        </MainLayout>
    )
}
