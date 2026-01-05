import { Package, ChevronRight, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import MainLayout from '../../../layouts/MainLayout'
import useAuth from '../../../hooks/useAuth'
import useUserOrders from '../../../hooks/useUserOrders'
import './Perfil.css'

export default function Ordenes () {
    const { user } = useAuth()
    const { orders, loading, error } = useUserOrders(user?.id)

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={20} className='status-icon success' />
            case 'cancelled':
                return <XCircle size={20} className='status-icon error' />
            case 'pending':
                return <Clock size={20} className='status-icon warning' />
            default:
                return <AlertCircle size={20} className='status-icon info' />
        }
    }

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pendiente',
            processing: 'En proceso',
            completed: 'Completado',
            cancelled: 'Cancelado',
            delivered: 'Entregado'
        }
        return labels[status] || status
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price)
    }

    const renderOrderCard = (order) => (
        <Link 
            key={order.id} 
            to={`/status/${order.code}`}
            className='order-card'
        >
            <div className='order-header'>
                <div className='order-code'>
                    <Package size={20} />
                    <span>Orden #{order.code}</span>
                </div>
                <div className='order-status'>
                    {getStatusIcon(order.status)}
                    <span>{getStatusLabel(order.status)}</span>
                </div>
            </div>

            <div className='order-info'>
                <div className='order-date'>
                    <Clock size={16} />
                    <span>{formatDate(order.created_at)}</span>
                </div>
                {order.direccion && (
                    <div className='order-address'>
                        <MapPin size={16} />
                        <span>{order.direccion}</span>
                    </div>
                )}
            </div>

            {order.order_items && order.order_items.length > 0 && (
                <div className='order-items'>
                    <p className='order-items-count'>
                        {order.order_items.length} {order.order_items.length === 1 ? 'producto' : 'productos'}
                    </p>
                    <ul className='order-items-list'>
                        {order.order_items.slice(0, 3).map(item => (
                            <li key={item.id}>
                                {item.quantity}x {item.name}
                            </li>
                        ))}
                        {order.order_items.length > 3 && (
                            <li className='more-items'>
                                +{order.order_items.length - 3} más
                            </li>
                        )}
                    </ul>
                </div>
            )}

            <div className='order-footer'>
                <div className='order-total'>
                    <span className='total-label'>Total:</span>
                    <span className='total-amount'>{formatPrice(order.total)}</span>
                </div>
                <ChevronRight size={20} className='order-arrow' />
            </div>
        </Link>
    )

    return (
        <MainLayout>
            <section className='page-content'>    
                <div className='perfil-container'>
                    <div className='perfil-header'>
                        <Package size={64} />
                        <h1>Mis Órdenes</h1>
                    </div>

                    <div className='perfil-card'>
                        {loading ? (
                            <p className='loading-message'>Cargando órdenes...</p>
                        ) : error ? (
                            <div className='error-message'>
                                <p>{error}</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <>
                                <p className='empty-state'>Aún no tienes órdenes realizadas</p>
                                <p className='empty-state-hint'>Cuando realices un pedido, aparecerá aquí</p>
                            </>
                        ) : (
                            <div className='orders-list'>
                                {orders.map(renderOrderCard)}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </MainLayout>
    )
}
