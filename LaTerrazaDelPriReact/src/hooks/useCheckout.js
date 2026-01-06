import { useState } from 'react';
import { createOrder, createPayment, getPaymentStatus } from '../api/orders.api';
import useCart from './useCart';
import useAuth from './useAuth';

export function useCheckout() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null);
    const { clearCart, items } = useCart();
    const { user } = useAuth();

    const createOrderFromCart = async (checkoutData) => {
        try {
            setLoading(true);
            setError(null);

            // Preparar items del carrito
            const orderItems = items.map(item => ({
                product_id: item.id,
                quantity: item.qty || item.quantity || 1
            }));

            // Datos de la orden
            const orderPayload = {
                direccion: checkoutData.address,
                items: orderItems,
                coupon_code: checkoutData.couponCode || null,
                sede_id: checkoutData.sede_id
            };

            // Si es invitado, agregar datos de contacto
            if (!user) {
                orderPayload.guest_nombre = checkoutData.firstName;
                orderPayload.guest_apellido = checkoutData.lastName;
                orderPayload.guest_email = checkoutData.email;
                orderPayload.guest_telefono = checkoutData.phone;
            }

            console.log('📦 Payload de orden:', orderPayload);

            // Crear orden
            const response = await createOrder(orderPayload);
            const order = response.data;

            setCurrentOrder(order);

            // Limpiar carrito después de crear la orden
            clearCart();

            return order;
        } catch (err) {
            console.error('Error creando orden:', err);
            setError(err.response?.data?.errors?.[0] || err.response?.data?.error || 'Error al crear la orden');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const processPayment = async (orderCode, paymentData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await createPayment(orderCode, paymentData);
            return response.data;
        } catch (err) {
            console.error('Error procesando pago:', err);
            setError(err.response?.data?.error || 'Error al procesar el pago');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async (orderCode) => {
        try {
            const response = await getPaymentStatus(orderCode);
            return response.data;
        } catch (err) {
            console.error('Error consultando estado del pago:', err);
            throw err;
        }
    };

    const resetCheckout = () => {
        setCurrentOrder(null);
        setError(null);
    };

    return {
        loading,
        error,
        currentOrder,
        createOrderFromCart,
        processPayment,
        checkPaymentStatus,
        resetCheckout
    };
}
