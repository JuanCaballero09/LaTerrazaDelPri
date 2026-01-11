import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import useCart from '../../hooks/useCart';
import useSedes from '../../hooks/useSedes';
import { useConfig } from '../../hooks/useConfig';
import useAuth from '../../hooks/useAuth';
import useUserAddresses from '../../hooks/useUserAddresses';
import { createAddress } from '../../api/users.api';
import { MapPin, Save, MapPinned } from 'lucide-react';
import { loadGoogleMapsAPI, initializePlaceAutocomplete, calculateDistanceHaversine, calculateDeliveryCost, getDirections } from '../../utils/googleMaps';
import { ShoppingBasket, Motorbike, Store } from 'lucide-react';
import ImgDefault  from '../../assets/images/ImagenNoDisponible4-3.png'
import './Cart.css';

export default function CartPage() {
    const navigate = useNavigate();
    const { 
        items, increase, decrease, removeItem, totalItems, totalPrice,
        address, setAddress, addressData, setAddressData, 
        selectedSede, setSelectedSede, deliveryCost, setDeliveryCost,
        deliveryType, setDeliveryType
    } = useCart();
    const { sedes, nearestSede } = useSedes();
    const { googleMapKey } = useConfig();
    const { user } = useAuth();
    const { addresses, loading: loadingAddresses, refetch: refetchAddresses } = useUserAddresses(user?.id);
    const [paid, setPaid] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [googleMapsReady, setGoogleMapsReady] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const [showSavedAddresses, setShowSavedAddresses] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const userSelectedSedeRef = useRef(false);
    const attemptedAutoSelectRef = useRef(false);
    const isAddressDisabled = deliveryType === 'recogida' || !googleMapsReady || !selectedSede || !selectedSede.id;
    const isPayDisabled = items.length === 0 || !selectedSede || !selectedSede.id || (deliveryType === 'domicilio' && (!address || !address.trim()));
    
    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (modalVisible) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [modalVisible]);

    useEffect(() => {
        loadGoogleMapsAPI()
            .then(() => {
                console.log('Google Maps API loaded successfully');
                setGoogleMapsReady(true);
            })
            .catch(error => {
                console.error('Failed to load Google Maps API:', error);
            });
    }, []);

    useEffect(() => {
        if (googleMapsReady && inputRef.current && !autocompleteRef.current) {
            autocompleteRef.current = initializePlaceAutocomplete(inputRef.current, (data) => {
                setAddressData(data);
                setAddress(data.formattedAddress);
                console.log('Dirección actualizada:', data);
            });
        }
    }, [googleMapsReady]);

    // Intentar auto-seleccionar la sede más cercana usando geolocalización
    useEffect(() => {
        if (attemptedAutoSelectRef.current) return; // ya intentado
        if (userSelectedSedeRef.current) return; // el usuario ya eligió manualmente

        if ((!selectedSede || !selectedSede.id) && Array.isArray(sedes) && sedes.length > 0) {
            if (!navigator.geolocation) {
                attemptedAutoSelectRef.current = true;
                return;
            }

            attemptedAutoSelectRef.current = true;
            navigator.geolocation.getCurrentPosition((pos) => {
                try {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    let nearest = null;
                    let minDist = Infinity;
                    sedes.forEach(s => {
                        const sLat = parseFloat(s.latitud);
                        const sLng = parseFloat(s.longitud);
                        if (Number.isFinite(sLat) && Number.isFinite(sLng)) {
                            const d = calculateDistanceHaversine(lat, lng, sLat, sLng);
                            if (d < minDist) {
                                minDist = d;
                                nearest = s;
                            }
                        }
                    });

                    if (nearest) {
                        setSelectedSede(nearest);
                        console.log('Sede seleccionada automáticamente por geolocalización:', nearest);
                    } else if (sedes.length > 0) {
                        setSelectedSede(sedes[0]);
                    }
                } catch (err) {
                    console.error('Error seleccionando sede por geolocalización:', err);
                    if (sedes.length > 0) setSelectedSede(sedes[0]);
                }
            }, (err) => {
                console.warn('Geolocalización no disponible o permiso denegado:', err);
                if (sedes.length > 0) setSelectedSede(sedes[0]);
            }, { enableHighAccuracy: false, timeout: 5000 });
        }
    }, [sedes]);

    // Si no hay sede seleccionada, elegir la primera sede activa disponible
    useEffect(() => {
        if ((!selectedSede || !selectedSede.id) && Array.isArray(sedes) && sedes.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedSede(sedes[0]);
        }
        // Si la sede actual ya no está en la lista (por ejemplo fue desactivada), seleccionar la primera
        if (selectedSede && Array.isArray(sedes)) {
            const exists = sedes.find(s => String(s.id) === String(selectedSede.id));
            if (!exists && sedes.length > 0) setSelectedSede(sedes[0]);
        }
    }, [sedes]);

    const handleSaveAddress = async () => {
        if (!user || !addressData || !address) {
            alert('Debes ingresar una dirección válida para guardarla');
            return;
        }

        try {
            setSavingAddress(true);
            await createAddress(user.id, {
                nombre: 'Dirección de envío',
                direccion_completa: addressData.formattedAddress,
                barrio: addressData.barrio || '',
                ciudad: addressData.ciudad || '',
                departamento: addressData.departamento || '',
                codigo_postal: addressData.codigoPostal || '',
                latitud: addressData.latitude.toString(),
                longitud: addressData.longitude.toString(),
                principal: addresses.length === 0
            });
            alert('✅ Dirección guardada exitosamente');
            refetchAddresses();
        } catch (error) {
            console.error('Error guardando dirección:', error);
            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.message || 
                                'Error al guardar la dirección';
            alert(errorMessage);
        } finally {
            setSavingAddress(false);
        }
    };

    const handleSelectSavedAddress = (savedAddress) => {
        const data = {
            formattedAddress: savedAddress.direccion_completa,
            latitude: parseFloat(savedAddress.latitud),
            longitude: parseFloat(savedAddress.longitud),
            barrio: savedAddress.barrio || '',
            ciudad: savedAddress.ciudad || '',
            departamento: savedAddress.departamento || '',
            codigoPostal: savedAddress.codigo_postal || '',
        };
        setAddressData(data);
        setAddress(data.formattedAddress);
        
        // Forzar actualización del input si existe
        if (inputRef.current) {
            inputRef.current.value = data.formattedAddress;
        }
        
        setShowSavedAddresses(false);
        console.log('📍 Dirección guardada seleccionada:', data);
    };

    const handleUseMyLocation = () => {
        if (!googleMapsReady || !selectedSede || !selectedSede.id) {
            // No hacer nada si el campo está deshabilitado
            alert('No es posible usar la ubicación hasta seleccionar una sede y que Google Maps esté listo');
            return;
        }

        if (!navigator.geolocation) {
            alert('Geolocalización no soportada por este navegador');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            try {
                if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
                    alert('Google Maps Geocoder no disponible');
                    return;
                }

                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        const place = results[0];
                        const components = place.address_components || [];
                        const addressData = {
                            formattedAddress: place.formatted_address || place.name,
                            latitude: lat,
                            longitude: lng,
                            barrio: '',
                            ciudad: '',
                            departamento: '',
                            codigoPostal: '',
                        };

                        components.forEach(component => {
                            const types = component.types;
                            if (types.includes('sublocality_level_1') || types.includes('sublocality') || types.includes('neighborhood')) {
                                addressData.barrio = component.long_name;
                            }
                            if (types.includes('locality') || types.includes('postal_town')) {
                                addressData.ciudad = component.long_name;
                            }
                            if (types.includes('administrative_area_level_1')) {
                                addressData.departamento = component.long_name;
                            }
                            if (types.includes('postal_code')) {
                                addressData.codigoPostal = component.long_name;
                            }
                        });

                        setAddressData(addressData);
                        setAddress(addressData.formattedAddress);
                        console.log('📍 Dirección desde ubicación actual:', addressData);
                    } else {
                        console.error('Geocoder failed:', status);
                        alert('No se pudo obtener la dirección desde la ubicación actual');
                    }
                });
            } catch (error) {
                console.error('Error al reverse-geocoding:', error);
                alert('Error al obtener la dirección desde la ubicación');
            }

        }, (err) => {
            console.error('Error geolocalización:', err);
            if (err.code === 1) alert('Permiso denegado para acceder a la ubicación');
            else alert('No se pudo obtener la ubicación del dispositivo');
        }, { enableHighAccuracy: true, timeout: 10000 });
    };

    const handlePay = async () => {
        if (items.length === 0 || !selectedSede) {
            return;
        }

        // Si es recogida, no necesitamos dirección ni calcular ruta
        if (deliveryType === 'recogida') {
            const info = {
                distance: 0,
                deliveryCost: 0,
                estimatedTime: 20, // Solo tiempo de preparación
                origin: `${selectedSede.latitud},${selectedSede.longitud}`,
                destination: `${selectedSede.latitud},${selectedSede.longitud}`,
            };
            setDeliveryInfo(info);
            setDeliveryCost(0);
            setModalVisible(true);
            return;
        }

        // Si es domicilio, validar dirección
        if (!addressData || !address || !address.trim()) {
            alert('Debes ingresar una dirección de entrega para el domicilio');
            return;
        }

        const origin = { lat: parseFloat(selectedSede.latitud), lng: parseFloat(selectedSede.longitud) };
        const destination = { lat: parseFloat(addressData.latitude), lng: parseFloat(addressData.longitude) };

        try {
            const route = await getDirections(origin, destination, 'two_wheeler');
            const distance = route.distanceKm;
            const estimatedTime = route.durationMin + 20; // en minutos
            const deliveryCostCalculated = calculateDeliveryCost(distance);

            const info = {
                distance: distance.toFixed(2),
                deliveryCost: deliveryCostCalculated,
                estimatedTime,
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                rawRoute: route.raw,
            };

            setDeliveryInfo(info);
            setDeliveryCost(deliveryCostCalculated);
            setModalVisible(true);
            console.log('🚚 Ruta obtenida desde Directions API:', route);
        } catch (err) {
            console.warn('⚠️ Directions API falló, usando cálculo local Haversine:', err);
            const distance = calculateDistanceHaversine(origin.lat, origin.lng, destination.lat, destination.lng);
            const deliveryCostCalculated = calculateDeliveryCost(distance);
            const estimatedTime = Math.round((distance / 25) * 60) + 20;
            const info = {
                distance: distance.toFixed(2),
                deliveryCost: deliveryCostCalculated,
                estimatedTime,
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
            };

            setDeliveryInfo(info);
            setDeliveryCost(deliveryCostCalculated);
            setModalVisible(true);
            console.log('🚚 Cálculo local:', info);
        }
    };

    return (
        <MainLayout>
            <section className="page-content">
                <div className="cart-container">
                    <div className="cart-items">
                        <h2>Carrito ({totalItems})</h2>
                        {items.length === 0 ? (
                            <section className="cart-empty">
                                <ShoppingBasket />
                                <p>El carrito está vacío</p>
                            </section>
                        ) : (
                            items.map((item, index) => (
                                <div className="cart-item" key={`${item.id}-${item.tamano_selected || ''}-${index}`}>
                                    {(item.imagen_url) ? (
                                        <img src={item.imagen_url} alt={item.nombre} />
                                    ) : (
                                        <img src={ImgDefault} alt="Imagen no disponible" />
                                    )}
                                    <div className="cart-item-body">
                                        <h4>{item.nombre}</h4>
                                        {item.tamano_selected && (
                                            <span className="cart-item-size">Tamaño: {item.tamano_selected}</span>
                                        )}
                                        {item.ingredientes && item.ingredientes.length > 0 && (
                                            <small>{item.ingredientes.slice(0, 3).join(', ')}{item.ingredientes.length > 3 ? '...' : ''}</small>
                                        )}
                                        <div className="cart-controls">
                                            <button onClick={() => decrease(item)}>-</button>
                                            <span>{item.qty}</span>
                                            <button onClick={() => increase(item)}>+</button>
                                            <button className="remove" onClick={() => removeItem(item)}>Eliminar</button>
                                        </div>
                                    </div>
                                    <div className="cart-item-price">{parseFloat(item?.precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <aside className="cart-checkout">
                        <h3>Resumen</h3>
                        <p><strong>Items:</strong> {totalItems}</p>
                        <p><strong>Total:</strong> {parseFloat(totalPrice).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>

                        {paid ? (
                            <div className="paid-msg">Pago realizado. Gracias!</div>
                        ) : (
                            <>
                                <strong>Sede:
                                    <select value={selectedSede?.id || ''} onChange={e => { userSelectedSedeRef.current = true; setSelectedSede(sedes.find(sede => sede.id === parseInt(e.target.value))); }}>
                                        <option value="">Selecciona una sede</option>
                                        {sedes.map(sede => (
                                            <option key={sede.id} value={sede.id}>{sede.nombre} - {sede.municipio}</option>
                                        ))}
                                    </select>
                                </strong>
                                <br />
                                <strong>Tipo de entrega:</strong>
                                <div className="delivery-type-selector">
                                    <label className={`delivery-option ${deliveryType === 'domicilio' ? 'selected' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="deliveryType" 
                                            value="domicilio" 
                                            checked={deliveryType === 'domicilio'} 
                                            onChange={(e) => setDeliveryType(e.target.value)} 
                                        />
                                        <span><Motorbike /> Domicilio</span>
                                    </label>
                                    <label className={`delivery-option ${deliveryType === 'recogida' ? 'selected' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="deliveryType" 
                                            value="recogida" 
                                            checked={deliveryType === 'recogida'} 
                                            onChange={(e) => {
                                                setDeliveryType(e.target.value);
                                                setDeliveryCost(0);
                                            }} 
                                        />
                                        <span><Store /> Recoger en sede</span>
                                    </label>
                                </div>
                                <br />
                                {deliveryType === 'domicilio' && (
                                    <>
                                        <strong>Dirección:</strong>
                                        {user && addresses.length > 0 && (
                                            <button 
                                                type="button" 
                                                onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                                                className='btn-address'
                                            >
                                                <MapPinned size={18} />
                                                {showSavedAddresses ? 'Ocultar' : 'Ver'} direcciones guardadas ({addresses.length})
                                            </button>
                                        )}
                                        
                                        {showSavedAddresses && user && addresses.length > 0 && (
                                            <div style={{
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                marginBottom: '12px',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '6px',
                                                background: '#fff'
                                            }}>
                                                {addresses.map((addr) => (
                                                    <div 
                                                        key={addr.id}
                                                        onClick={() => handleSelectSavedAddress(addr)}
                                                        style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #f0f0f0',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                                                            <MapPin size={16} style={{color: '#FFC107'}} />
                                                            <strong style={{fontSize: '0.9em'}}>{addr.nombre || addr.ciudad || 'Dirección'}</strong>
                                                            {addr.principal && (
                                                                <span style={{
                                                                    fontSize: '0.75em',
                                                                    background: '#FFC107',
                                                                    color: '#1a1a1a',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px',
                                                                    fontWeight: '600'
                                                                }}>Principal</span>
                                                            )}
                                                        </div>
                                                        <p style={{margin: 0, fontSize: '0.85em', color: '#666'}}>
                                                            {addr.direccion_completa}
                                                        </p>
                                                        {addr.barrio && (
                                                            <p style={{margin: '4px 0 0 0', fontSize: '0.8em', color: '#999'}}>
                                                                {addr.barrio}{addr.ciudad ? `, ${addr.ciudad}` : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                            <input 
                                                ref={inputRef}
                                                value={address} 
                                                onChange={e => setAddress(e.target.value)} 
                                                placeholder="Dirección de envío" 
                                                disabled={isAddressDisabled}
                                                className={isAddressDisabled ? 'disabled' : ''}
                                                style={{flex: 1}}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleUseMyLocation} 
                                                className='cart-checkout-ubicacion' 
                                                title="Usar mi ubicación"
                                                disabled={isAddressDisabled}
                                            >
                                                <MapPin />
                                            </button>
                                            {user && address && addressData && (
                                                <button 
                                                    type="button" 
                                                    onClick={handleSaveAddress} 
                                                    className='cart-checkout-ubicacion'
                                                    title="Guardar dirección"
                                                    disabled={savingAddress || isAddressDisabled}
                                                    style={{background: savingAddress ? '#ccc' : '#28a745'}}
                                                >
                                                    <Save />
                                                </button>
                                            )}
                                        </div>
                                        {!googleMapsReady && <small style={{color: '#999'}}>Cargando Google Maps...</small>}
                                        {user && !loadingAddresses && addresses.length === 0 && address && addressData && (
                                            <small style={{color: '#666', display: 'block', marginTop: '8px'}}>
                                                Puedes guardar esta dirección para usarla después
                                            </small>
                                        )}
                                    </>
                                )}
                                {deliveryType === 'recogida' && (
                                    <div className="pickup-info">
                                        <p>Recoge tu pedido en:</p>
                                        <strong>{selectedSede?.nombre}</strong>
                                        <p style={{fontSize: '0.9em', color: '#666'}}>{selectedSede?.direccion}, {selectedSede?.municipio}</p>
                                    </div>
                                )}
                                <button className={"btn-pay "+(isPayDisabled ? 'disabled' : '')} onClick={handlePay} disabled={isPayDisabled}>Pagar</button>
                            </>
                        )}
                    </aside>
                </div>

                {modalVisible && deliveryInfo && selectedSede && (
                    <div className="modal" onClick={(e) => e.target.className === 'modal' && setModalVisible(false)}>
                        <div className="modal-content">
                            <div className='modal-header'>
                                <h3>Verificar Información del Pedido</h3>
                                <button className="modal-close" onClick={() => setModalVisible(false)}>×</button>
                            </div>
                            

                            <div className="modal-body">    
                                <div className="modal-section">
                                    <p><strong>Tipo de entrega:</strong> {deliveryType === 'recogida' ? '🏪 Recoger en sede' : '🛵 Domicilio'} - {selectedSede.nombre}</p>
                                    
                                    {deliveryType === 'domicilio' && addressData && (
                                        <>
                                            <p><strong>Dirección:</strong> {addressData.formattedAddress}</p>
                                            {addressData.barrio && <p><strong>Barrio:</strong> {addressData.barrio}</p>}
                                            {addressData.ciudad && <p><strong>Ciudad:</strong> {addressData.ciudad}</p>}
                                            <p><strong>Distancia desde la sede:</strong> {deliveryInfo.distance} km</p>
                                            <p><strong>Tiempo estimado:</strong> {deliveryInfo.estimatedTime} minutos (incluye preparación y entrega)</p>
                                        </>
                                    )}
                                    
                                    {deliveryType === 'recogida' && (
                                        <>
                                            <p><strong>Dirección de la sede:</strong> {selectedSede.direccion}, {selectedSede.municipio}</p>
                                            <p><strong>Tiempo estimado de preparación:</strong> {deliveryInfo.estimatedTime} minutos</p>
                                        </>
                                    )}
                                </div>

                                <div className="modal-section">
                                    <h4>Resumen de Pago</h4>
                                    <p><strong>Subtotal productos:</strong> ${totalPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP</p>
                                    {deliveryType === 'domicilio' && (
                                        <p><strong>Costo de domicilio:</strong> ${deliveryInfo.deliveryCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP</p>
                                    )}
                                    {deliveryType === 'recogida' && (
                                        <p style={{color: '#28a745'}}><strong>Costo de recogida:</strong> $0 COP (¡Gratis!)</p>
                                    )}
                                    <p style={{fontSize: '1.2em', marginTop: '10px'}}><strong>Total a pagar:</strong> ${(totalPrice + deliveryInfo.deliveryCost).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP</p>
                                </div>
                            </div>

                            <div className="modal-footer">
                                {deliveryType === 'domicilio' && (
                                    <div className="map-container" style={{margin: '20px 0', borderRadius: '8px', overflow: 'hidden'}}>
                                        {googleMapKey ? (
                                            <iframe
                                                src={`https://www.google.com/maps/embed/v1/directions?key=${googleMapKey}&origin=${deliveryInfo.origin}&destination=${deliveryInfo.destination}&mode=driving&language=es&region=CO`}
                                                width="100%"
                                                height="400"
                                                zoom="12"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                            ></iframe>
                                        ) : (
                                            <div style={{padding: '20px', textAlign: 'center', background: '#f0f0f0', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <p>Cargando mapa...</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button onClick={() => setModalVisible(false)} style={{flex: 1, padding: '12px', background: '#6c757d'}}>Volver a editar</button>
                                    <button onClick={() => { setModalVisible(false); navigate('/checkout'); }} style={{flex: 1, padding: '12px', background: '#28a745'}}>Continuar al pago</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </MainLayout>
    );
}
