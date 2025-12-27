import { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import useCart from '../../hooks/useCart';
import useSedes from '../../hooks/useSedes';
import { useConfig } from '../../hooks/useConfig';
import { MapPin } from 'lucide-react';
import { loadGoogleMapsAPI, initializePlaceAutocomplete, calculateDistanceHaversine, calculateDeliveryCost, getDirections } from '../../utils/googleMaps';
import { ShoppingBasket } from 'lucide-react';
import './Cart.css';

export default function CartPage() {
    const { items, increase, decrease, removeItem, totalItems, totalPrice } = useCart();
    const { sedes, nearestSede } = useSedes();
    const { googleMapKey } = useConfig();
    const [address, setAddress] = useState('');
    const [addressData, setAddressData] = useState(null);
    const [paid, setPaid] = useState(false);
    const [selectedSede, setSelectedSede] = useState(nearestSede);
    const [modalVisible, setModalVisible] = useState(false);
    const [googleMapsReady, setGoogleMapsReady] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const userSelectedSedeRef = useRef(false);
    const attemptedAutoSelectRef = useRef(false);
    const isAddressDisabled = !googleMapsReady || !selectedSede || !selectedSede.id;
    const isPayDisabled = items.length === 0 || !selectedSede || !selectedSede.id || !address || !address.trim();

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
            setSelectedSede(sedes[0]);
        }
        // Si la sede actual ya no está en la lista (por ejemplo fue desactivada), seleccionar la primera
        if (selectedSede && Array.isArray(sedes)) {
            const exists = sedes.find(s => String(s.id) === String(selectedSede.id));
            if (!exists && sedes.length > 0) setSelectedSede(sedes[0]);
        }
    }, [sedes]);

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
        if (isPayDisabled || !addressData || !selectedSede) {
            // Si está deshabilitado o faltan datos, no ejecutar
            return;
        }
        const origin = { lat: parseFloat(selectedSede.latitud), lng: parseFloat(selectedSede.longitud) };
        const destination = { lat: parseFloat(addressData.latitude), lng: parseFloat(addressData.longitude) };

        try {
            const route = await getDirections(origin, destination, 'two_wheeler');
            const distance = route.distanceKm;
            const estimatedTime = route.durationMin + 20; // en minutos
            const deliveryCost = calculateDeliveryCost(distance);

            const info = {
                distance: distance.toFixed(2),
                deliveryCost,
                estimatedTime,
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                rawRoute: route.raw,
            };

            setDeliveryInfo(info);
            setModalVisible(true);
            console.log('🚚 Ruta obtenida desde Directions API:', route);
        } catch (err) {
            console.warn('⚠️ Directions API falló, usando cálculo local Haversine:', err);
            const distance = calculateDistanceHaversine(origin.lat, origin.lng, destination.lat, destination.lng);
            const deliveryCost = calculateDeliveryCost(distance);
            const estimatedTime = Math.round((distance / 25) * 60) + 20;
            const info = {
                distance: distance.toFixed(2),
                deliveryCost,
                estimatedTime,
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
            };

            setDeliveryInfo(info);
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
                            items.map(item => (
                                <div className="cart-item" key={item.id}>
                                    <img src={item.imagen_url} alt={item.nombre} />
                                    <div className="cart-item-body">
                                        <h4>{item.nombre}</h4>
                                        {item.ingredientes && item.ingredientes.length > 0 && (
                                            <small>{item.ingredientes.slice(0, 3).join(', ')}{item.ingredientes.length > 3 ? '...' : ''}</small>
                                        )}
                                        <div className="cart-controls">
                                            <button onClick={() => decrease(item.id)}>-</button>
                                            <span>{item.qty}</span>
                                            <button onClick={() => increase(item.id)}>+</button>
                                            <button className="remove" onClick={() => removeItem(item.id)}>Eliminar</button>
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
                                <strong>Dirección:</strong>
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
                                    <button type="button" onClick={handleUseMyLocation} className='cart-checkout-ubicacion' title="Usar mi ubicación"><MapPin /></button>
                                </div>
                                {!googleMapsReady && <small style={{color: '#999'}}>Cargando Google Maps...</small>}
                                <button className={"btn-pay "+(isPayDisabled ? 'disabled' : '')} onClick={handlePay} disabled={isPayDisabled}>Pagar</button>
                            </>
                        )}
                    </aside>
                </div>

                {modalVisible && deliveryInfo && addressData && selectedSede && (
                    <div className="modal" onClick={(e) => e.target.className === 'modal' && setModalVisible(false)}>
                        <div className="modal-content">
                            <div className='modal-header'>
                                <h3>Verificar Información del Pedido</h3>
                                <button className="modal-close" onClick={() => setModalVisible(false)}>×</button>
                            </div>
                            

                            <div className="modal-body">    
                                <div className="modal-section">
                                    <p><strong>Tipo de entrega:</strong> Domicilio - {selectedSede.nombre}</p>
                                    <p><strong>Dirección:</strong> {addressData.formattedAddress}</p>
                                    {addressData.barrio && <p><strong>Barrio:</strong> {addressData.barrio}</p>}
                                    {addressData.ciudad && <p><strong>Ciudad:</strong> {addressData.ciudad}</p>}
                                    <p><strong>Distancia desde la sede:</strong> {deliveryInfo.distance} km</p>
                                    <p><strong>Tiempo estimado:</strong> {deliveryInfo.estimatedTime} minutos (incluye preparación y entrega)</p>
                                </div>

                                <div className="modal-section">
                                    <h4>Resumen de Pago</h4>
                                    <p><strong>Subtotal productos:</strong> ${totalPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP</p>
                                    <p><strong>Costo de domicilio:</strong> ${deliveryInfo.deliveryCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP</p>
                                    <p style={{fontSize: '1.2em', marginTop: '10px'}}><strong>Total a pagar:</strong> ${(totalPrice + deliveryInfo.deliveryCost).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP</p>
                                </div>
                            </div>

                            <div className="modal-footer">
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

                                <div className="modal-actions">
                                    <button onClick={() => setModalVisible(false)} style={{flex: 1, padding: '12px', background: '#6c757d'}}>Volver a editar</button>
                                    <button onClick={() => { setModalVisible(false); setPaid(true); }} style={{flex: 1, padding: '12px', background: '#28a745'}}>Continuar al pago</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </MainLayout>
    );
}
