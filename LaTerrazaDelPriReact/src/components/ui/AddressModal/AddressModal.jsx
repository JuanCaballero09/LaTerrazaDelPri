import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Loader } from 'lucide-react';
import { loadGoogleMapsAPI, initializePlaceAutocomplete } from '../../../utils/googleMaps';
import './AddressModal.css';

export default function AddressModal({ isOpen, onClose, onSave, initialData = null, isLoading = false }) {
    const [googleMapsReady, setGoogleMapsReady] = useState(false);
    
    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);
    
    // Inicializar formData basado en initialData
    const getInitialFormData = () => {
        if (initialData) {
            return {
                nombre: initialData.nombre || '',
                direccion_completa: initialData.direccion_completa || '',
                barrio: initialData.barrio || '',
                ciudad: initialData.ciudad || '',
                departamento: initialData.departamento || '',
                codigo_postal: initialData.codigo_postal || '',
                latitud: initialData.latitud || '',
                longitud: initialData.longitud || '',
                principal: initialData.principal || false
            };
        }
        return {
            nombre: '',
            direccion_completa: '',
            barrio: '',
            ciudad: '',
            departamento: '',
            codigo_postal: '',
            latitud: '',
            longitud: '',
            principal: false
        };
    };
    
    const [formData, setFormData] = useState(getInitialFormData);

    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    // Función para actualizar la dirección desde el mapa
    const updateAddressFromMap = (data) => {
        setFormData(prev => ({
            ...prev,
            direccion_completa: data.formattedAddress,
            barrio: data.barrio || prev.barrio,
            ciudad: data.ciudad || prev.ciudad,
            departamento: data.departamento || prev.departamento,
            codigo_postal: data.codigoPostal || prev.codigo_postal,
            latitud: data.latitude.toString(),
            longitud: data.longitude.toString()
        }));
    };

    // Resetear formulario cuando cambia initialData
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            // Resetear referencias del mapa
            if (mapRef.current) {
                mapRef.current.classList.remove('map-initialized');
            }
            autocompleteRef.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    // Cargar Google Maps API
    useEffect(() => {
        if (isOpen) {
            loadGoogleMapsAPI()
                .then(() => {
                    console.log('Google Maps API loaded successfully');
                    setGoogleMapsReady(true);
                })
                .catch(error => {
                    console.error('Failed to load Google Maps API:', error);
                });
        }
    }, [isOpen]);

    // Inicializar autocomplete
    useEffect(() => {
        if (googleMapsReady && inputRef.current && !autocompleteRef.current && isOpen) {
            autocompleteRef.current = initializePlaceAutocomplete(inputRef.current, (data) => {
                updateAddressFromMap(data);
            });
        }
    }, [googleMapsReady, isOpen]);

    // Inicializar mapa
    useEffect(() => {
        if (googleMapsReady && mapRef.current && !mapRef.current.classList.contains('map-initialized') && isOpen) {
            try {
                const lat = formData.latitud ? parseFloat(formData.latitud) : 4.7110;
                const lng = formData.longitud ? parseFloat(formData.longitud) : -74.0721;

                const map = new window.google.maps.Map(mapRef.current, {
                    center: { lat, lng },
                    zoom: formData.latitud ? 15 : 12,
                    mapTypeControl: false,
                    streetViewControl: false,
                });

                const marker = new window.google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    draggable: true,
                    title: 'Arrastre para ubicar'
                });

                // Evento cuando se suelta el marcador
                marker.addListener('dragend', (event) => {
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();

                    // Hacer reverse geocoding para obtener la dirección
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            const place = results[0];
                            const components = place.address_components || [];
                            const addressData = {
                                formattedAddress: place.formatted_address,
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

                            updateAddressFromMap(addressData);
                        }
                    });
                });

                // Evento cuando se hace clic en el mapa
                map.addListener('click', (event) => {
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();
                    
                    marker.setPosition(event.latLng);

                    // Hacer reverse geocoding
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            const place = results[0];
                            const components = place.address_components || [];
                            const addressData = {
                                formattedAddress: place.formatted_address,
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

                            updateAddressFromMap(addressData);
                        }
                    });
                });

                mapRef.current.classList.add('map-initialized');
                mapRef.current.mapInstance = map;
                markerRef.current = marker;

            } catch (error) {
                console.error('Error initializing map:', error);
            }
        }
    }, [googleMapsReady, isOpen, formData.latitud, formData.longitud]);

    // Actualizar marcador cuando cambian las coordenadas manualmente
    useEffect(() => {
        if (markerRef.current && formData.latitud && formData.longitud) {
            const lat = parseFloat(formData.latitud);
            const lng = parseFloat(formData.longitud);
            if (!isNaN(lat) && !isNaN(lng)) {
                markerRef.current.setPosition({ lat, lng });
                if (mapRef.current && mapRef.current.mapInstance) {
                    mapRef.current.mapInstance.panTo({ lat, lng });
                }
            }
        }
    }, [formData.latitud, formData.longitud]);

    const handleUseMyLocation = () => {
        if (!googleMapsReady) {
            alert('Espere a que Google Maps esté listo');
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
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        const place = results[0];
                        const components = place.address_components || [];
                        const addressData = {
                            formattedAddress: place.formatted_address,
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

                        updateAddressFromMap(addressData);

                        // Mover el marcador
                        if (markerRef.current) {
                            markerRef.current.setPosition({ lat, lng });
                        }
                        if (mapRef.current && mapRef.current.mapInstance) {
                            mapRef.current.mapInstance.panTo({ lat, lng });
                            mapRef.current.mapInstance.setZoom(15);
                        }
                    } else {
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!formData.nombre.trim()) {
            alert('Por favor ingrese un nombre para la dirección');
            return;
        }
        if (!formData.direccion_completa.trim()) {
            alert('Por favor ingrese una dirección');
            return;
        }

        onSave(formData);
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="address-modal-overlay" onClick={(e) => e.target.className === 'address-modal-overlay' && handleClose()}>
            <div className="address-modal">
                <div className="address-modal-header">
                    <h2>{initialData ? 'Editar Dirección' : 'Agregar Nueva Dirección'}</h2>
                    <button 
                        className="address-modal-close" 
                        onClick={handleClose}
                        disabled={isLoading}
                        type="button"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="address-modal-form">
                    <div className="address-modal-body">
                        {/* Sección del Mapa */}
                        <div className="address-map-section">
                            <div className="address-map-header">
                                <h3>Ubicación en el Mapa</h3>
                                <button 
                                    type="button" 
                                    onClick={handleUseMyLocation}
                                    className="btn-location"
                                    disabled={!googleMapsReady}
                                    title="Usar mi ubicación actual"
                                >
                                    <MapPin size={18} />
                                    Mi Ubicación
                                </button>
                            </div>
                            
                            <div className="address-map-container">
                                {!googleMapsReady ? (
                                    <div className="address-map-loading">
                                        <Loader className="spinner" />
                                        <p>Cargando mapa...</p>
                                    </div>
                                ) : (
                                    <div ref={mapRef} className="address-map"></div>
                                )}
                            </div>

                            <div className="address-autocomplete">
                                <label>Buscar Dirección:</label>
                                <input 
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Escribe una dirección..."
                                    disabled={!googleMapsReady}
                                />
                                {!googleMapsReady && <small>Esperando Google Maps...</small>}
                            </div>
                        </div>

                        {/* Sección del Formulario */}
                        <div className="address-form-section">
                            <h3>Detalles de la Dirección</h3>
                            
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre de la Dirección *</label>
                                <input 
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: Casa, Oficina, Casa de mamá..."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="direccion_completa">Dirección Completa *</label>
                                <textarea 
                                    id="direccion_completa"
                                    name="direccion_completa"
                                    value={formData.direccion_completa}
                                    onChange={handleChange}
                                    placeholder="Dirección completa con detalles adicionales..."
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="barrio">Barrio</label>
                                    <input 
                                        type="text"
                                        id="barrio"
                                        name="barrio"
                                        value={formData.barrio}
                                        onChange={handleChange}
                                        placeholder="Barrio"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="ciudad">Municipio</label>
                                    <input 
                                        type="text"
                                        id="ciudad"
                                        name="ciudad"
                                        value={formData.ciudad}
                                        onChange={handleChange}
                                        placeholder="Ciudad"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="departamento">Departamento</label>
                                    <input 
                                        type="text"
                                        id="departamento"
                                        name="departamento"
                                        value={formData.departamento}
                                        onChange={handleChange}
                                        placeholder="Departamento"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="codigo_postal">Código Postal</label>
                                    <input 
                                        type="text"
                                        id="codigo_postal"
                                        name="codigo_postal"
                                        value={formData.codigo_postal}
                                        onChange={handleChange}
                                        placeholder="Código Postal"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="latitud">Latitud</label>
                                    <input 
                                        type="text"
                                        id="latitud"
                                        name="latitud"
                                        value={formData.latitud}
                                        onChange={handleChange}
                                        placeholder="Latitud"
                                        readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="longitud">Longitud</label>
                                    <input 
                                        type="text"
                                        id="longitud"
                                        name="longitud"
                                        value={formData.longitud}
                                        onChange={handleChange}
                                        placeholder="Longitud"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="form-group-checkbox">
                                <input 
                                    type="checkbox"
                                    id="principal"
                                    name="principal"
                                    checked={formData.principal}
                                    onChange={handleChange}
                                />
                                <label htmlFor="principal">Establecer como dirección principal</label>
                            </div>
                        </div>
                    </div>

                    <div className="address-modal-footer">
                        <button 
                            type="button" 
                            onClick={handleClose}
                            className="btn-cancel"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="btn-save"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="spinner" size={18} />
                                    Guardando...
                                </>
                            ) : (
                                initialData ? 'Actualizar' : 'Guardar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
