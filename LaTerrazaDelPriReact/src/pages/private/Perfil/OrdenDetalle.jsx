import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Package, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, Phone, User, CreditCard, Store } from 'lucide-react'
import MainLayout from '../../../layouts/MainLayout'
import useAuth from '../../../hooks/useAuth'
import { getOrder } from '../../../api/orders.api'
import './Perfil.css'

export default function OrdenDetalle() {
    const { code } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true)
                const response = await getOrder(code, user?.email)
                console.log('🔍 Orden cargada en detalle:', response.data)
                setOrder(response.data)
            } catch (err) {
                console.error('Error cargando orden:', err)
                setError('No se pudo cargar la orden')
            } finally {
                setLoading(false)
            }
        }

        if (code) {
            fetchOrder()
        }
    }, [code, user])

    const getStatusIcon = (status) => {
        switch (status) {
            case 'finalizado':
            case 'completed':
                return <CheckCircle size={24} className='status-icon success' />
            case 'cancelado':
            case 'cancelled':
                return <XCircle size={24} className='status-icon error' />
            case 'pendiente':
            case 'pending':
                return <Clock size={24} className='status-icon warning' />
            case 'pagado':
            case 'tomado':
                return <AlertCircle size={24} className='status-icon info' />
            default:
                return <AlertCircle size={24} className='status-icon info' />
        }
    }

    const getStatusLabel = (status) => {
        const labels = {
            pendiente: 'Pendiente de Pago',
            pagado: 'Pagado',
            tomado: 'En Preparación',
            finalizado: 'Entregado',
            cancelado: 'Cancelado',
            pending: 'Pendiente',
            processing: 'En proceso',
            completed: 'Completado',
            cancelled: 'Cancelado',
            delivered: 'Entregado'
        }
        return labels[status] || status
    }

    const getPaymentMethodLabel = (method) => {
        const labels = {
            cash: 'Efectivo',
            card: 'Tarjeta',
            nequi: 'Nequi'
        }
        return labels[method] || method
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

    if (loading) {
        return (
            <MainLayout>
                <section className='page-content'>
                    <div className='perfil-container'>
                        <p className='loading-message'>Cargando orden...</p>
                    </div>
                </section>
            </MainLayout>
        )
    }

    if (error || !order) {
        return (
            <MainLayout>
                <section className='page-content'>
                    <div className='perfil-container'>
                        <div className='error-message'>
                            <p>{error || 'Orden no encontrada'}</p>
                            <Link to='/perfil/ordenes' className='btn btn-primary'>
                                Volver a mis órdenes
                            </Link>
                        </div>
                    </div>
                </section>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <section className='page-content'>
                <div className='perfil-container'>
                    <button 
                        onClick={() => navigate('/perfil/ordenes')} 
                        className='back-button'
                    >
                        <ChevronLeft size={20} />
                        Volver a mis órdenes
                    </button>

                    <div className='order-detail-header'>
                        <div className='order-detail-title'>
                            <Package size={32} />
                            <h1>Orden #{order.code}</h1>
                        </div>
                        <div className='order-detail-status'>
                            {getStatusIcon(order.status)}
                            <span>{getStatusLabel(order.status)}</span>
                        </div>
                    </div>

                    <div className='order-detail-grid'>
                        {/* Información general */}
                        <div className='perfil-card'>
                            <h3 className='card-title'>Información General</h3>
                            <div className='detail-row'>
                                <Clock size={18} />
                                <div>
                                    <strong>Fecha de pedido</strong>
                                    <p>{formatDate(order.created_at)}</p>
                                </div>
                            </div>
                            {order.updated_at && order.updated_at !== order.created_at && (
                                <div className='detail-row'>
                                    <Clock size={18} />
                                    <div>
                                        <strong>Última actualización</strong>
                                        <p>{formatDate(order.updated_at)}</p>
                                    </div>
                                </div>
                            )}
                            <div className='detail-row'>
                                <CreditCard size={18} />
                                <div>
                                    <strong>Método de pago</strong>
                                    <p>
                                        {order.payment_method === 'card' ? (
                                            <>
                                                💳 {order.payment_type_card === 'debit' ? 'Tarjeta Débito' : 'Tarjeta Crédito'}
                                            </>
                                        ) : order.payment_method === 'nequi' ? (
                                            '📱 Nequi'
                                        ) : order.payment_method === 'cash' ? (
                                            '💵 Efectivo'
                                        ) : (
                                            'No especificado'
                                        )}
                                    </p>
                                </div>
                            </div>
                            {order.sede && (
                                <div className='detail-row'>
                                    <Store size={18} />
                                    <div>
                                        <strong>Sede</strong>
                                        <p>{order.sede.nombre || order.sede.ciudad}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Información de entrega */}
                        <div className='perfil-card'>
                            <h3 className='card-title'>Información de Entrega</h3>
                            <div className='detail-row'>
                                <User size={18} />
                                <div>
                                    <strong>Cliente</strong>
                                    <p>{order.nombre_cliente || order.customer_name || `${user?.nombre} ${user?.apellido}` || 'Cliente'}</p>
                                </div>
                            </div>
                            {(order.email || order.customer_email) && (
                                <div className='detail-row'>
                                    <User size={18} />
                                    <div>
                                        <strong>Email</strong>
                                        <p>{order.email || order.customer_email}</p>
                                    </div>
                                </div>
                            )}
                            {(order.telefono || order.customer_phone) && (
                                <div className='detail-row'>
                                    <Phone size={18} />
                                    <div>
                                        <strong>Teléfono</strong>
                                        <p>{order.telefono || order.customer_phone}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Tipo de entrega */}
                            <div className='detail-row'>
                                <Package size={18} />
                                <div>
                                    <strong>Tipo de entrega</strong>
                                    <p>{order.delivery_type === 'domicilio' || order.tipo_entrega === 'domicilio' ? 'A Domicilio' : 'Recogida en Sede'}</p>
                                </div>
                            </div>
                            
                            {/* Mostrar dirección solo si es domicilio */}
                            {(order.delivery_type === 'domicilio' || order.tipo_entrega === 'domicilio') && order.direccion && (
                                <div className='detail-row'>
                                    <MapPin size={18} />
                                    <div>
                                        <strong>Dirección de entrega</strong>
                                        <p>{order.direccion}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Productos */}
                        <div className='perfil-card full-width'>
                            <h3 className='card-title'>Productos</h3>
                            <div className='order-items-detail'>
                                {order.items && order.items.length > 0 ? (
                                    <table className='items-table'>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Tamaño</th>
                                                <th>Cantidad</th>
                                                <th>Precio</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, index) => (
                                                <tr key={item.id || index}>
                                                    <td>{item.product_name || item.product?.nombre || 'Producto'}</td>
                                                    <td>{item.tamano || '-'}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{formatPrice(item.price)}</td>
                                                    <td>{formatPrice(item.quantity * item.price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No hay productos en esta orden</p>
                                )}
                            </div>
                        </div>

                        {/* Resumen de pago */}
                        <div className='perfil-card full-width'>
                            <h3 className='card-title'>Resumen de Pago</h3>
                            <div className='payment-summary'>
                                <div className='summary-row'>
                                    <span>Subtotal productos:</span>
                                    <span>{formatPrice(
                                        order.delivery_cost 
                                            ? order.total - order.delivery_cost 
                                            : (order.subtotal || order.total)
                                    )}</span>
                                </div>
                                
                                {/* Mostrar costo de envío si es domicilio */}
                                {order.delivery_type === 'domicilio' && order.delivery_cost > 0 && (
                                    <div className='summary-row'>
                                        <span>Domicilio:</span>
                                        <span>{formatPrice(order.delivery_cost)}</span>
                                    </div>
                                )}
                                
                                {/* Mostrar "Recogida gratis" si es recogida en sede */}
                                {order.delivery_type === 'recogida' && (
                                    <div className='summary-row'>
                                        <span>Recogida en sede:</span>
                                        <span className='free-delivery'>¡Gratis!</span>
                                    </div>
                                )}
                                
                                {/* Mostrar tarifa de procesamiento para tarjeta/nequi */}
                                {(order.payment_method === 'card' || order.payment_method === 'nequi') && order.processing_fee > 0 && (
                                    <div className='summary-row'>
                                        <span>Tarifa procesamiento (2.65% + $700 + IVA):</span>
                                        <span>{formatPrice(order.processing_fee)}</span>
                                    </div>
                                )}
                                
                                <div className='summary-row total'>
                                    <strong>Total:</strong>
                                    <strong>{formatPrice(order.total)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {order.status === 'pendiente' && (
                        <div className='order-actions'>
                            <button 
                                onClick={() => navigate(`/checkout?order=${order.code}`)}
                                className='btn btn-primary btn-lg'
                            >
                                Completar Pago
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </MainLayout>
    )
}
