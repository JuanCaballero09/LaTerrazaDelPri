import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import { useCheckout } from '../../hooks/useCheckout';
import useAuth from '../../hooks/useAuth';
import { getPaymentStatus, cancelPayment, getOrder } from '../../api/orders.api';
import { X, CreditCard, Smartphone, Banknote, Check, Loader, Clock, XCircle, AlertCircle } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderCode = searchParams.get('order'); // Orden desde URL para completar pago
    const { user } = useAuth();
    const { items, totalPrice, clear, address: cartAddress, addressData, selectedSede, deliveryType, deliveryCost } = useCart();
    const { createOrderFromCart, processPayment, loading, error } = useCheckout();

    const [step, setStep] = useState(() => {
        try {
            const saved = localStorage.getItem('checkout_step')
            return saved ? parseInt(saved) : 1
        } catch {
            return 1
        }
    });
    const [currentOrder, setCurrentOrder] = useState(() => {
        try {
            const saved = localStorage.getItem('checkout_currentOrder')
            return saved ? JSON.parse(saved) : null
        } catch {
            return null
        }
    });

    // Datos del checkout
    // IMPORTANTE: Siempre priorizar valores del carrito (deliveryCost, deliveryType) sobre los guardados
    const [checkoutData, setCheckoutData] = useState(() => {
        try {
            const saved = localStorage.getItem('checkout_data')
            if (saved) {
                const parsed = JSON.parse(saved)
                return {
                    ...parsed,
                    email: user?.email || parsed.email || '',
                    address: cartAddress || parsed.address || '',
                    sede_id: selectedSede?.id || parsed.sede_id || null,
                    // Siempre usar valores del carrito (no usar || porque 0 es válido)
                    delivery_type: deliveryType ?? parsed.delivery_type ?? 'domicilio',
                    delivery_cost: typeof deliveryCost === 'number' ? deliveryCost : (parsed.delivery_cost ?? 0)
                }
            }
        } catch (e){console.error(e);}
        return {
            // Datos de invitado
            firstName: '',
            lastName: '',
            email: user?.email || '',
            phone: '',
            // Dirección (desde el carrito)
            address: cartAddress || '',
            // Términos
            acceptTerms: false,
            acceptData: false,
            // Cupón
            couponCode: '',
            // Sede
            sede_id: selectedSede?.id || null,
            // Tipo de entrega
            delivery_type: deliveryType ?? 'domicilio',
            delivery_cost: typeof deliveryCost === 'number' ? deliveryCost : 0
        }
    });

    // Datos del pago
    const [paymentMethod, setPaymentMethod] = useState(() => {
        try {
            return localStorage.getItem('checkout_paymentMethod') || 'cash'
        } catch {
            return 'cash'
        }
    });
    const [cardData, setCardData] = useState(() => {
        try {
            const saved = localStorage.getItem('checkout_cardData')
            return saved ? JSON.parse(saved) : {
                cardNumber: '',
                cardHolder: '',
                expMonth: '',
                expYear: '',
                cvc: '',
                typeCard: 'credit',
                installments: '1'
            }
        } catch {
            return {
                cardNumber: '',
                cardHolder: '',
                expMonth: '',
                expYear: '',
                cvc: '',
                typeCard: 'credit',
                installments: '1'
            }
        }
    });
    const [nequiData, setNequiData] = useState(() => {
        try {
            const saved = localStorage.getItem('checkout_nequiData')
            return saved ? JSON.parse(saved) : { phoneNumber: user?.telefono || '' }
        } catch {
            return { phoneNumber: user?.telefono || '' }
        }
    });

    // Actualizar nequiData cuando el usuario cargue
    useEffect(() => {
        if (user?.telefono && !nequiData.phoneNumber) {
            setNequiData({ phoneNumber: user.telefono });
        }
    }, [user]);

    // Sincronizar datos del carrito con checkoutData
    // Se ejecuta cada vez que cambia la dirección, sede, tipo de entrega o costo
    useEffect(() => {
        setCheckoutData(prev => {
            // Solo actualizar si hay cambios reales
            const newDeliveryCost = typeof deliveryCost === 'number' ? deliveryCost : prev.delivery_cost;
            const newDeliveryType = deliveryType ?? prev.delivery_type;
            const newAddress = cartAddress || prev.address;
            const newSedeId = selectedSede?.id ?? prev.sede_id;
            
            // Si recogida, forzar delivery_cost a 0
            const finalDeliveryCost = newDeliveryType === 'recogida' ? 0 : newDeliveryCost;
            
            // Evitar actualización innecesaria
            if (
                prev.address === newAddress &&
                prev.sede_id === newSedeId &&
                prev.delivery_type === newDeliveryType &&
                prev.delivery_cost === finalDeliveryCost
            ) {
                return prev;
            }
            
            console.log('🔄 Sincronizando checkoutData:', {
                delivery_type: newDeliveryType,
                delivery_cost: finalDeliveryCost,
                sede_id: newSedeId
            });
            
            return {
                ...prev,
                address: newAddress,
                sede_id: newSedeId,
                delivery_type: newDeliveryType,
                delivery_cost: finalDeliveryCost
            };
        });
    }, [cartAddress, selectedSede, deliveryType, deliveryCost]);

    // Resetear checkout si hay items en el carrito pero no hay orden activa
    // Esto asegura que al entrar desde el carrito se empiece desde el paso 1
    useEffect(() => {
        const savedOrder = localStorage.getItem('checkout_currentOrder');
        const savedStep = localStorage.getItem('checkout_step');
        
        // Si hay items en el carrito y no hay orden guardada, resetear a paso 1
        if (items.length > 0 && !savedOrder) {
            console.log('🔄 Reseteando checkout - nueva sesión desde carrito');
            setStep(1);
            setCurrentOrder(null);
            localStorage.removeItem('checkout_step');
            localStorage.removeItem('checkout_currentOrder');
        }
        // Si hay una orden guardada pero estamos en paso 2 y no hay currentOrder en state
        // significa que es una nueva sesión - verificar si la orden es válida
        else if (savedOrder && savedStep === '2' && !currentOrder) {
            const parsed = JSON.parse(savedOrder);
            setCurrentOrder(parsed);
        }
        // Si el step guardado es 3 pero no hay orden, forzar paso 1
        else if (savedStep === '3' && !savedOrder) {
            console.log('🔄 Reseteando checkout - paso 3 sin orden');
            setStep(1);
            setCurrentOrder(null);
            localStorage.removeItem('checkout_step');
            localStorage.removeItem('checkout_currentOrder');
        }
    }, []);

    // Persistir datos en localStorage
    useEffect(() => {
        localStorage.setItem('checkout_step', step.toString())
    }, [step]);

    useEffect(() => {
        if (currentOrder) {
            localStorage.setItem('checkout_currentOrder', JSON.stringify(currentOrder))
        } else {
            localStorage.removeItem('checkout_currentOrder')
        }
    }, [currentOrder]);

    useEffect(() => {
        localStorage.setItem('checkout_data', JSON.stringify(checkoutData))
    }, [checkoutData]);

    useEffect(() => {
        localStorage.setItem('checkout_paymentMethod', paymentMethod)
    }, [paymentMethod]);

    useEffect(() => {
        localStorage.setItem('checkout_cardData', JSON.stringify(cardData))
    }, [cardData]);

    useEffect(() => {
        localStorage.setItem('checkout_nequiData', JSON.stringify(nequiData))
    }, [nequiData]);

    useEffect(() => {
        // Si viene con orderCode desde URL y no hay orden cargada, cargarla
        if (orderCode && !currentOrder) {
            const loadOrder = async () => {
                setLoadingOrder(true);
                try {
                    const response = await getOrder(orderCode);
                    const orderData = response.data;
                    
                    if (orderData) {
                        console.log('Orden cargada:', orderData);
                        console.log('Items de la orden:', orderData.items);
                        setCurrentOrder(orderData);
                        // Si la orden ya está pagada o completada, redirigir a su detalle
                        if (orderData.status === 'pagado' || orderData.status === 'finalizado' || 
                            orderData.status === 'tomado' || orderData.status === 'entregado') {
                            navigate(`/perfil/orden/${orderCode}`, { replace: true });
                            return;
                        }
                        
                        // Establecer datos de checkout desde la orden
                        setCheckoutData({
                            delivery_type: orderData.delivery_type || 'domicilio',
                            address: orderData.direccion || '',
                            sede_id: orderData.sede_id || null,
                            email: orderData.email || user?.email || '',
                            firstName: orderData.first_name || user?.nombre || '',
                            lastName: orderData.last_name || user?.apellido || '',
                            phone: orderData.phone || user?.telefono || '',
                            notes: orderData.notes || '',
                            delivery_cost: orderData.delivery_cost || 0
                        });
                        
                        // Si está pendiente, ir al paso de pago
                        setStep(2);
                    }
                } catch (err) {
                    console.error('Error cargando orden:', err);
                    // Si no se puede cargar, redirigir al carrito
                    navigate('/carrito');
                } finally {
                    setLoadingOrder(false);
                }
            };
            loadOrder();
            return;
        }
        
        // Si el carrito está vacío y no hay orden desde URL, redirigir
        if (items.length === 0 && !orderCode && !currentOrder) {
            navigate('/carrito');
            return;
        }

        // Si es usuario autenticado, llenar email
        if (user) {
            setCheckoutData(prev => ({
                ...prev,
                email: user.email || '',
                firstName: user.nombre || '',
                lastName: user.apellido || '',
                phone: user.telefono || ''
            }));
        }
    }, [items, user, navigate, orderCode, currentOrder]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Obtener el costo de envío actual (priorizar checkoutData pero usar deliveryCost como fallback)
    const currentDeliveryCost = checkoutData.delivery_cost ?? deliveryCost ?? 0;

    // Calcular total (productos + envío si es domicilio)
    // Si hay orden cargada, usar su total; si no, calcular del carrito
    const subtotalProductos = currentOrder ? (currentOrder.total - (currentOrder.delivery_cost || 0)) : totalPrice;
    const subtotalConEnvio = currentOrder 
        ? currentOrder.total 
        : (checkoutData.delivery_type === 'recogida' ? totalPrice : totalPrice + currentDeliveryCost);

    // Calcular tarifa Wompi: 2.65% + $700 + IVA 19%
    // Solo aplica para tarjeta y nequi
    const calculateWompiFee = (amount) => {
        const baseFee = (amount * 0.0265) + 700; // 2.65% + $700
        const feeWithIva = baseFee * 1.19; // + IVA 19%
        return Math.round(feeWithIva);
    };

    const wompiFee = (paymentMethod === 'card' || paymentMethod === 'nequi') 
        ? calculateWompiFee(subtotalConEnvio) 
        : 0;

    const total = subtotalConEnvio + wompiFee;

    // Estado para polling del pago
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [pollingActive, setPollingActive] = useState(false);
    const [pollingTime, setPollingTime] = useState(0);
    const [redirectCountdown, setRedirectCountdown] = useState(5); // Countdown para redirección
    const [loadingOrder, setLoadingOrder] = useState(false); // Estado de carga de orden desde URL

    const clearCheckoutData = () => {
        localStorage.removeItem('checkout_step');
        localStorage.removeItem('checkout_currentOrder');
        localStorage.removeItem('checkout_data');
        localStorage.removeItem('checkout_paymentMethod');
        localStorage.removeItem('checkout_cardData');
        localStorage.removeItem('checkout_nequiData');
    };

    // Efecto para iniciar countdown cuando el pago es aprobado
    useEffect(() => {
        if (paymentStatus === 'approved' && step === 3) {
            // Iniciar countdown de 5 segundos
            const countdownInterval = setInterval(() => {
                setRedirectCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        clearCheckoutData();
                        clear(); // Limpiar carrito
                        navigate(`/perfil/orden/${currentOrder?.code}`, { replace: true });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(countdownInterval);
        }
    }, [paymentStatus, step, navigate, clear, currentOrder]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCheckoutData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateStep1 = () => {
        if (!user) {
            // Validar datos de invitado
            if (!checkoutData.firstName.trim()) return 'El nombre es requerido';
            if (!checkoutData.lastName.trim()) return 'El apellido es requerido';
            if (!checkoutData.email.trim()) return 'El email es requerido';
            if (!checkoutData.phone.trim()) return 'El teléfono es requerido';
            if (!/^\d{10}$/.test(checkoutData.phone)) return 'El teléfono debe tener 10 dígitos';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutData.email)) return 'Email inválido';
        }
        
        // Solo validar dirección si es domicilio
        if (checkoutData.delivery_type === 'domicilio') {
            if (!checkoutData.address.trim()) return 'La dirección es requerida para domicilio';
            if (checkoutData.address.length < 10) return 'La dirección debe tener al menos 10 caracteres';
        }
        
        return null;
    };

    const handleContinueToPayment = async () => {
        const validationError = validateStep1();
        if (validationError) {
            alert(validationError);
            return;
        }

        try {
            // Debug: verificar datos que se envían
            console.log('📋 checkoutData a enviar:', {
                delivery_type: checkoutData.delivery_type,
                delivery_cost: checkoutData.delivery_cost,
                address: checkoutData.address,
                sede_id: checkoutData.sede_id
            });
            console.log('🛒 deliveryCost del carrito:', deliveryCost);
            
            // Crear la orden
            const order = await createOrderFromCart(checkoutData);
            setCurrentOrder(order);
            setStep(2);
        } catch (err) {
            console.error('Error al crear orden:', err);
        }
    };

    const handleProcessPayment = async () => {
        if (!checkoutData.acceptTerms || !checkoutData.acceptData) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }

        if (!currentOrder) {
            alert('No hay orden activa');
            return;
        }

        try {
            let paymentData = {
                payment_method: paymentMethod,
                email: checkoutData.email,
                accept_terms: '1',
                accept_data: '1'
            };

            if (paymentMethod === 'card') {
                // Validar datos de tarjeta
                if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expMonth || 
                    !cardData.expYear || !cardData.cvc) {
                    alert('Completa todos los datos de la tarjeta');
                    return;
                }

                paymentData = {
                    ...paymentData,
                    card_number: cardData.cardNumber.replace(/\s/g, ''),
                    card_holder: cardData.cardHolder,
                    exp_month: cardData.expMonth,
                    exp_year: cardData.expYear,
                    cvc: cardData.cvc,
                    type_card: cardData.typeCard,
                    installments: cardData.installments
                };
            } else if (paymentMethod === 'nequi') {
                if (!nequiData.phoneNumber || !/^\d{10}$/.test(nequiData.phoneNumber)) {
                    alert('Ingresa un número de teléfono válido de 10 dígitos');
                    return;
                }

                paymentData.phone_number = nequiData.phoneNumber;
            }

            const paymentResponse = await processPayment(currentOrder.code, paymentData);
            
            // Para efectivo, completar inmediatamente
            if (paymentMethod === 'cash') {
                clear();
                clearCheckoutData();
                setPaymentStatus('approved');
                setStep(3);
                return;
            }

            // Para tarjeta y nequi, iniciar polling
            setStep(3);
            setPaymentStatus('pending');
            setPollingActive(true);
            setPollingTime(0);
            
        } catch (err) {
            console.error('Error procesando pago:', err);
        }
    };

    // Polling para verificar estado del pago (tarjeta/nequi)
    const pollingIntervalRef = useRef(null);
    const pollingTimerRef = useRef(null);

    useEffect(() => {
        if (pollingActive && currentOrder && (paymentMethod === 'card' || paymentMethod === 'nequi')) {
            // Polling cada 3 segundos
            pollingIntervalRef.current = setInterval(async () => {
                try {
                    const response = await getPaymentStatus(currentOrder.code);
                    const status = response.data?.status;
                    
                    console.log('📡 Estado del pago:', status);
                    
                    if (status === 'approved') {
                        setPaymentStatus('approved');
                        setPollingActive(false);
                        setRedirectCountdown(5); // Reiniciar countdown
                    } else if (status === 'declined' || status === 'cancelled') {
                        setPaymentStatus(status);
                        setPollingActive(false);
                    }
                } catch (err) {
                    console.error('Error consultando estado:', err);
                }
            }, 3000);

            // Timer para contar tiempo de espera
            pollingTimerRef.current = setInterval(() => {
                setPollingTime(prev => prev + 1);
            }, 1000);

            return () => {
                clearInterval(pollingIntervalRef.current);
                clearInterval(pollingTimerRef.current);
            };
        }
    }, [pollingActive, currentOrder, paymentMethod]);

    // Cancelar pago
    const handleCancelPayment = async () => {
        if (!currentOrder) return;
        
        try {
            await cancelPayment(currentOrder.code);
            setPaymentStatus('cancelled');
            setPollingActive(false);
        } catch (err) {
            console.error('Error cancelando pago:', err);
            alert('No se pudo cancelar el pago');
        }
    };

    // Formatear tiempo de espera
    const formatWaitTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Mostrar loading si se está cargando la orden
    if (loadingOrder) {
        return (
            <div className="checkout-container">
                <div className="checkout-wrapper">
                    <div className="checkout-loading">
                        <Loader className="spin" size={48} />
                        <p>Cargando orden...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Solo redirigir si no hay items Y no hay orden actual Y no hay orderCode
    if (items.length === 0 && !currentOrder && !orderCode) {
        return null;
    }

    return (
        <div className="checkout-container">
            <div className="checkout-wrapper">
                {/* Steps Indicator */}
                <div className="checkout-steps">
                    <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <span>Datos</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <span>Pago</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`checkout-step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <span>Confirmación</span>
                    </div>
                </div>

                {/* Content */}
                <div className="checkout-content">
                    {/* Left Column - Form */}
                    <div className="checkout-form">
                        {error && (
                            <div className="checkout-error">
                                <X size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Step 1: Datos de contacto y dirección */}
                        {step === 1 && (
                            <>
                                <h2>Información de Contacto</h2>
                                
                                {!user && (
                                    <div className="form-section">
                                        <h3>Datos Personales</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Nombre *</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={checkoutData.firstName}
                                                    onChange={handleInputChange}
                                                    placeholder="Tu nombre"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Apellido *</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={checkoutData.lastName}
                                                    onChange={handleInputChange}
                                                    placeholder="Tu apellido"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={checkoutData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="tu@email.com"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Teléfono *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={checkoutData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="3001234567"
                                                    maxLength="10"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="form-section">
                                    <h3>{checkoutData.delivery_type === 'recogida' ? 'Recoger en Sede' : 'Dirección de Entrega'}</h3>
                                    
                                    <div className="delivery-type-badge">
                                        {checkoutData.delivery_type === 'recogida' ? (
                                            <span className="badge badge-pickup">Recoger en sede</span>
                                        ) : (
                                            <span className="badge badge-delivery">Domicilio</span>
                                        )}
                                    </div>

                                    {checkoutData.delivery_type === 'domicilio' && (
                                        <div className="form-group">
                                            <label>Dirección completa *</label>
                                            <textarea
                                                name="address"
                                                value={checkoutData.address}
                                                placeholder="Calle, número, apartamento, referencias..."
                                                rows="3"
                                                readOnly
                                                disabled
                                                style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                                            />
                                        </div>
                                    )}
                                    
                                    {checkoutData.delivery_type === 'recogida' && selectedSede && (
                                        <div className="pickup-info">
                                            <p><strong>Sede:</strong> {selectedSede.nombre}</p>
                                            <p><strong>Dirección:</strong> {selectedSede.direccion}, {selectedSede.municipio}</p>
                                            {selectedSede.telefono && <p><strong>Teléfono:</strong> {selectedSede.telefono}</p>}
                                        </div>
                                    )}
                                </div>

                                <button 
                                    className="btn-primary-full" 
                                    onClick={handleContinueToPayment}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="spin" size={20} />
                                            Creando orden...
                                        </>
                                    ) : (
                                        'Continuar al Pago'
                                    )}
                                </button>
                            </>
                        )}

                        {/* Step 2: Método de pago */}
                        {step === 2 && currentOrder && (
                            <>
                                <h2>Método de Pago</h2>
                                <p className="order-code">Orden: <strong>{currentOrder.code}</strong></p>

                                <div className="payment-methods">
                                    <div 
                                        className={`payment-method ${paymentMethod === 'cash' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('cash')}
                                    >
                                        <Banknote size={24} />
                                        <span>Efectivo</span>
                                    </div>
                                    <div 
                                        className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <CreditCard size={24} />
                                        <span>Tarjeta</span>
                                    </div>
                                    <div 
                                        className={`payment-method ${paymentMethod === 'nequi' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('nequi')}
                                    >
                                        <img src="/NequiLogo.png" alt="" />
                                        <span>Nequi</span>
                                    </div>
                                </div>

                                {/* Formulario según método de pago */}
                                {paymentMethod === 'card' && (
                                    <div className="form-section">
                                        <h3>Datos de la Tarjeta</h3>
                                        <div className="form-group">
                                            <label>Número de Tarjeta *</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={cardData.cardNumber}
                                                onChange={handleCardInputChange}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Nombre en la Tarjeta *</label>
                                            <input
                                                type="text"
                                                name="cardHolder"
                                                value={cardData.cardHolder}
                                                onChange={handleCardInputChange}
                                                placeholder="NOMBRE APELLIDO"
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Mes *</label>
                                                <input
                                                    type="text"
                                                    name="expMonth"
                                                    value={cardData.expMonth}
                                                    onChange={handleCardInputChange}
                                                    placeholder="MM"
                                                    maxLength="2"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Año *</label>
                                                <input
                                                    type="text"
                                                    name="expYear"
                                                    value={cardData.expYear}
                                                    onChange={handleCardInputChange}
                                                    placeholder="AA"
                                                    maxLength="2"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>CVC *</label>
                                                <input
                                                    type="text"
                                                    name="cvc"
                                                    value={cardData.cvc}
                                                    onChange={handleCardInputChange}
                                                    placeholder="123"
                                                    maxLength="4"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Tipo de Tarjeta *</label>
                                                <select
                                                    name="typeCard"
                                                    value={cardData.typeCard}
                                                    onChange={handleCardInputChange}
                                                >
                                                    <option value="credit">Crédito</option>
                                                    <option value="debit">Débito</option>
                                                </select>
                                            </div>
                                            {cardData.typeCard === 'credit' && (
                                                <div className="form-group">
                                                    <label>Cuotas *</label>
                                                    <select
                                                        name="installments"
                                                        value={cardData.installments}
                                                        onChange={handleCardInputChange}
                                                    >
                                                        {[1, 2, 3, 6, 12, 24, 36].map(n => (
                                                            <option key={n} value={n}>{n} {n === 1 ? 'cuota' : 'cuotas'}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'nequi' && (
                                    <div className="form-section">
                                        <h3>Datos de Nequi</h3>
                                        <div className="form-group">
                                            <label>Número de Celular *</label>
                                            <input
                                                type="tel"
                                                value={nequiData.phoneNumber}
                                                onChange={(e) => setNequiData({ phoneNumber: e.target.value })}
                                                placeholder="3001234567"
                                                maxLength="10"
                                            />
                                        </div>
                                        <p className="nequi-info">
                                            Recibirás una notificación en tu app de Nequi para aprobar el pago.
                                        </p>
                                    </div>
                                )}

                                {paymentMethod === 'cash' && (
                                    <div className="cash-info">
                                        <p>Pagarás <strong>{formatCurrency(total)}</strong> en efectivo al recibir tu pedido.</p>
                                    </div>
                                )}

                                {/* Términos y condiciones */}
                                <div className="form-section">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="acceptTerms"
                                            checked={checkoutData.acceptTerms}
                                            onChange={handleInputChange}
                                        />
                                        <span>Acepto los términos y condiciones *</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="acceptData"
                                            checked={checkoutData.acceptData}
                                            onChange={handleInputChange}
                                        />
                                        <span>Autorizo el tratamiento de datos personales *</span>
                                    </label>
                                </div>

                                <div className="checkout-actions">
                                    <button 
                                        className="btn-secondary-full"
                                        onClick={() => setStep(1)}
                                        disabled={loading}
                                    >
                                        Volver
                                    </button>
                                    <button 
                                        className="btn-primary-full"
                                        onClick={handleProcessPayment}
                                        disabled={loading || !checkoutData.acceptTerms || !checkoutData.acceptData}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="spin" size={20} />
                                                Procesando...
                                            </>
                                        ) : (
                                            `Pagar ${formatCurrency(total)}`
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 3: Confirmación */}
                        {step === 3 && currentOrder && (
                            <div className="checkout-success">
                                {/* Estado: Esperando confirmación (tarjeta/nequi) */}
                                {(paymentMethod === 'card' || paymentMethod === 'nequi') && paymentStatus === 'pending' && (
                                    <>
                                        <div className="pending-icon">
                                            <Loader className="spin" size={48} />
                                        </div>
                                        <h2>Procesando Pago...</h2>
                                        <p className="order-code">Orden: <strong>{currentOrder.code}</strong></p>
                                        
                                        {paymentMethod === 'card' && (
                                            <p className="pending-message">
                                                Estamos verificando tu pago con tarjeta. Esto puede tomar unos segundos.
                                            </p>
                                        )}
                                        {paymentMethod === 'nequi' && (
                                            <div className="nequi-pending">
                                                <p className="pending-message">
                                                    <strong>📱 Revisa tu app de Nequi</strong>
                                                </p>
                                                <p className="pending-hint">
                                                    Abre la app de Nequi en tu celular y aprueba la solicitud de pago.
                                                </p>
                                            </div>
                                        )}

                                        <div className="wait-timer">
                                            <Clock size={16} />
                                            <span>Tiempo de espera: {formatWaitTime(pollingTime)}</span>
                                        </div>

                                        {/* Mostrar botón cancelar después de 30 segundos para tarjeta, 60 para nequi */}
                                        {((paymentMethod === 'card' && pollingTime >= 30) || 
                                          (paymentMethod === 'nequi' && pollingTime >= 60)) && (
                                            <>
                                                <button 
                                                    className="btn-secondary"
                                                    onClick={() => {
                                                        setPollingActive(false);
                                                        setPaymentStatus(null);
                                                        setStep(2);
                                                    }}
                                                    style={{ marginRight: '10px' }}
                                                >
                                                    Cambiar método de pago
                                                </button>
                                                <button 
                                                    className="btn-cancel"
                                                    onClick={handleCancelPayment}
                                                >
                                                    <XCircle size={18} />
                                                    Cancelar orden
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Estado: Pago aprobado (tarjeta/nequi) */}
                                {paymentStatus === 'approved' && paymentMethod !== 'cash' && (
                                    <>
                                        <div className="success-icon success-animation">
                                            <Check size={64} />
                                        </div>
                                        <h2>¡Pago Confirmado!</h2>
                                        <p className="order-code">Orden: <strong>{currentOrder.code}</strong></p>
                                        
                                        <p className="success-message">
                                            Tu pago de <strong>{formatCurrency(total)}</strong> ha sido procesado exitosamente. Recibirás un email de confirmación.
                                        </p>

                                        <div className="redirect-countdown">
                                            <Clock size={20} />
                                            <p>Redirigiendo en <strong>{redirectCountdown}</strong> segundo{redirectCountdown !== 1 ? 's' : ''}...</p>
                                        </div>

                                        <button 
                                            className="btn-primary-full"
                                            onClick={() => {
                                                clearCheckoutData();
                                                clear();
                                                navigate(`/perfil/orden/${currentOrder.code}`, { replace: true });
                                            }}
                                        >
                                            Ver mi orden ahora
                                        </button>
                                    </>
                                )}

                                {/* Estado: Pago rechazado */}
                                {paymentStatus === 'declined' && (
                                    <>
                                        <div className="error-icon">
                                            <XCircle size={48} />
                                        </div>
                                        <h2>Pago Rechazado</h2>
                                        <p className="order-code">Orden: <strong>{currentOrder.code}</strong></p>
                                        
                                        <p className="error-message">
                                            Tu pago no pudo ser procesado. Por favor verifica los datos de tu tarjeta o intenta con otro método de pago.
                                        </p>

                                        <div className="checkout-actions">
                                            <button 
                                                className="btn-secondary-full"
                                                onClick={() => {
                                                    setStep(2);
                                                    setPaymentStatus(null);
                                                }}
                                            >
                                                Cambiar método de pago
                                            </button>
                                            <button 
                                                className="btn-primary-full"
                                                onClick={() => {
                                                    setStep(2);
                                                    setPaymentStatus(null);
                                                }}
                                            >
                                                Intentar de nuevo
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Estado: Pago cancelado */}
                                {paymentStatus === 'cancelled' && (
                                    <>
                                        <div className="warning-icon">
                                            <AlertCircle size={48} />
                                        </div>
                                        <h2>Pago Cancelado</h2>
                                        <p className="order-code">Orden: <strong>{currentOrder.code}</strong></p>
                                        
                                        <p className="warning-message">
                                            El pago ha sido cancelado. Puedes intentar de nuevo o elegir otro método de pago.
                                        </p>

                                        <div className="checkout-actions">
                                            <button 
                                                className="btn-secondary-full"
                                                onClick={() => {
                                                    setStep(2);
                                                    setPaymentStatus(null);
                                                }}
                                            >
                                                Cambiar método de pago
                                            </button>
                                            <button 
                                                className="btn-primary-full"
                                                onClick={() => {
                                                    setStep(2);
                                                    setPaymentStatus(null);
                                                }}
                                            >
                                                Volver a intentar
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Estado: Efectivo (confirmación inmediata) */}
                                {paymentMethod === 'cash' && paymentStatus === 'approved' && (
                                    <>
                                        <div className="success-icon">
                                            <Check size={48} />
                                        </div>
                                        <h2>¡Pedido Confirmado!</h2>
                                        <p className="order-code">Orden: <strong>{currentOrder.code}</strong></p>
                                        
                                        <p className="success-message">
                                            Tu pedido ha sido confirmado. Pagarás <strong>{formatCurrency(total)}</strong> en efectivo al {checkoutData.delivery_type === 'recogida' ? 'recogerlo' : 'recibirlo'}.
                                        </p>

                                        <button 
                                            className="btn-primary-full"
                                            onClick={() => {
                                                clearCheckoutData();
                                                navigate('/perfil/ordenes');
                                            }}
                                        >
                                            Ver mis órdenes
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Resumen */}
                    <div className="checkout-summary">
                        <h3>Resumen del Pedido</h3>
                        
                        {/* Tipo de entrega */}
                        <div className="summary-delivery-type">
                            {checkoutData.delivery_type === 'recogida' ? (
                                <span className="delivery-badge pickup">Recoger en sede</span>
                            ) : (
                                <span className="delivery-badge delivery">Domicilio</span>
                            )}
                        </div>

                        <div className="summary-items">
                            {(currentOrder?.items || items).map((item, index) => {
                                // Manejar items de la orden (estructura diferente)
                                const itemName = item.product_name || item.nombre || 'Producto';
                                const itemSize = item.tamano || item.tamano_selected || '';
                                const itemQty = item.quantity || item.qty || 1;
                                const itemPrice = item.precio || item.price || 0;
                                
                                return (
                                    <div key={`${item.id}-${itemSize}-${index}`} className="summary-item">
                                        <span className="item-name">
                                            {itemName}{itemSize ? ` (${itemSize})` : ''} x {itemQty}
                                        </span>
                                        <span className="item-price">
                                            {formatCurrency(itemPrice * itemQty)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="summary-divider"></div>
                        
                        {/* Subtotal */}
                        <div className="summary-subtotal">
                            <span>Subtotal productos</span>
                            <span>{formatCurrency(subtotalProductos)}</span>
                        </div>
                        
                        {/* Costo de envío */}
                        <div className="summary-shipping">
                            <span>{checkoutData.delivery_type === 'recogida' ? 'Recogida' : 'Domicilio'}</span>
                            <span className={checkoutData.delivery_type === 'recogida' ? 'free-shipping' : ''}>
                                {checkoutData.delivery_type === 'recogida' ? '¡Gratis!' : formatCurrency(currentOrder?.delivery_cost || currentDeliveryCost)}
                            </span>
                        </div>

                        {/* Tarifa Wompi (solo para tarjeta y nequi) */}
                        {(paymentMethod === 'card' || paymentMethod === 'nequi') && (
                            <div className="summary-fee">
                                <span>
                                    Tarifa procesamiento
                                    <small className="fee-detail"> (2.65% + $700 + IVA)</small>
                                </span>
                                <span>{formatCurrency(wompiFee)}</span>
                            </div>
                        )}
                        
                        <div className="summary-divider"></div>
                        
                        {/* Total */}
                        <div className="summary-total">
                            <span>Total a pagar</span>
                            <span className="total-amount">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}