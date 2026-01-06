import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import { useCheckout } from '../../hooks/useCheckout';
import useAuth from '../../hooks/useAuth';
import { X, CreditCard, Smartphone, Banknote, Check, Loader } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, totalPrice, clearCart, address: cartAddress, addressData, selectedSede } = useCart();
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
    const [checkoutData, setCheckoutData] = useState(() => {
        try {
            const saved = localStorage.getItem('checkout_data')
            if (saved) {
                const parsed = JSON.parse(saved)
                return {
                    ...parsed,
                    email: user?.email || parsed.email || '',
                    address: cartAddress || parsed.address || '',
                    sede_id: selectedSede?.id || parsed.sede_id || null
                }
            }
        } catch {}
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
            sede_id: selectedSede?.id || null
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
            return saved ? JSON.parse(saved) : { phoneNumber: '' }
        } catch {
            return { phoneNumber: '' }
        }
    });

    // Sincronizar dirección del carrito con checkoutData
    useEffect(() => {
        if (cartAddress) {
            setCheckoutData(prev => ({
                ...prev,
                address: cartAddress,
                sede_id: selectedSede?.id || null
            }));
        }
    }, [cartAddress, selectedSede]);

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
        // Si el carrito está vacío, redirigir
        if (items.length === 0) {
            navigate('/carrito');
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
    }, [items, user, navigate]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const clearCheckoutData = () => {
        localStorage.removeItem('checkout_step');
        localStorage.removeItem('checkout_currentOrder');
        localStorage.removeItem('checkout_data');
        localStorage.removeItem('checkout_paymentMethod');
        localStorage.removeItem('checkout_cardData');
        localStorage.removeItem('checkout_nequiData');
    };

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
        
        if (!checkoutData.address.trim()) return 'La dirección es requerida';
        if (checkoutData.address.length < 10) return 'La dirección debe tener al menos 10 caracteres';
        
        return null;
    };

    const handleContinueToPayment = async () => {
        const validationError = validateStep1();
        if (validationError) {
            alert(validationError);
            return;
        }

        try {
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
            
            // Limpiar datos de checkout al completar
            clearCheckoutData();
            setStep(3);
        } catch (err) {
            console.error('Error procesando pago:', err);
        }
    };

    if (items.length === 0) {
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
                                    <h3>Dirección de Entrega</h3>
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
                                        <Smartphone size={24} />
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
                                        <p>✅ Pagarás <strong>{formatCurrency(total)}</strong> en efectivo al recibir tu pedido.</p>
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
                                            `Pagar ${formatCurrency(totalPrice)}`
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 3: Confirmación */}
                        {step === 3 && currentOrder && (
                            <div className="checkout-success">
                                <div className="success-icon">
                                    <Check size={48} />
                                </div>
                                <h2>¡Pedido Confirmado!</h2>
                                <p className="order-code">Orden: <strong>{currentOrder.code}</strong></p>
                                
                                {paymentMethod === 'cash' && (
                                    <p className="success-message">
                                        Tu pedido ha sido confirmado. Pagarás <strong>{formatCurrency(totalPrice)}</strong> en efectivo al recibirlo.
                                    </p>
                                )}
                                {paymentMethod === 'card' && (
                                    <p className="success-message">
                                        Tu pago está siendo procesado. Recibirás una confirmación por email.
                                    </p>
                                )}
                                {paymentMethod === 'nequi' && (
                                    <p className="success-message">
                                        Revisa tu app de Nequi para aprobar el pago.
                                    </p>
                                )}

                                <button 
                                    className="btn-primary-full"
                                    onClick={() => {
                                        clearCheckoutData();
                                        navigate('/');
                                    }}
                                >
                                    Volver al Inicio
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Resumen */}
                    <div className="checkout-summary">
                        <h3>Resumen del Pedido</h3>
                        <div className="summary-items">
                            {items.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="summary-item">
                                    <span className="item-name">
                                        {item.nombre} x {item.qty || 1}
                                    </span>
                                    <span className="item-price">
                                        {formatCurrency((item.precio || 0) * (item.qty || 1))}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-total">
                            <span>Total</span>
                            <span className="total-amount">{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
