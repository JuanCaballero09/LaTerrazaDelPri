import { fetchGoogleMapKey } from '../api/config.api';

// Variable global para rastrear si Google Maps ya está cargado
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let loadPromise = null;

/**
 * Verifica si Google Maps ya está cargado (por ejemplo, por Rails)
 */
export const isGoogleMapsAvailable = () => {
    return !!(window.google && window.google.maps && window.google.maps.places);
};

/**
 * Espera a que Google Maps esté disponible
 */
export const waitForGoogleMaps = (timeout = 5000) => {
    return new Promise((resolve, reject) => {
        if (isGoogleMapsAvailable()) {
            console.log('Google Maps API already available');
            return resolve();
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (isGoogleMapsAvailable()) {
                clearInterval(checkInterval);
                console.log('Google Maps API detected');
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('Timeout waiting for Google Maps API'));
            }
        }, 100);
    });
};

export const loadGoogleMapsAPI = async () => {
    // PRIMERO: Verificar si Google Maps ya está cargado (por Rails)
    if (isGoogleMapsAvailable()) {
        console.log('Google Maps API already loaded (probably by Rails)');
        return Promise.resolve();
    }

    // SEGUNDO: Intentar esperar a que Rails lo cargue
    try {
        await waitForGoogleMaps(3000);
        return Promise.resolve();
    } catch {
        console.log('Google Maps not loaded by Rails, loading dynamically...');
    }

    // TERCERO: Si no está cargado, cargarlo dinámicamente
    if (isGoogleMapsLoaded && window.google && window.google.maps) {
        console.log('Google Maps API already loaded');
        return Promise.resolve();
    }

    if (isGoogleMapsLoading && loadPromise) {
        console.log('Waiting for Google Maps API to load...');
        return loadPromise;
    }

    isGoogleMapsLoading = true;

    loadPromise = new Promise((resolve, reject) => {
        // Definir el callback global ANTES de cargar el script
        window.initAutocomplete = function() {
            console.log(' Google Maps API callback ejecutado');
            isGoogleMapsLoaded = true;
            isGoogleMapsLoading = false;
            resolve();
        };

        // Obtener la API key del backend de forma async
        fetchGoogleMapKey()
            .then(data => {
                if (!data || !data.google_map_key) {
                    throw new Error('No se pudo obtener la API key de Google Maps');
                }

                console.log('API Key obtenida, cargando Google Maps...');

                // Crear y cargar el script
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${data.google_map_key}&libraries=places&callback=initAutocomplete&language=es&region=CO&mode=weekly`;
                script.async = true;
                script.defer = true;
                
                script.onerror = () => {
                    console.error('Error loading Google Maps API script');
                    isGoogleMapsLoading = false;
                    isGoogleMapsLoaded = false;
                    reject(new Error('Failed to load Google Maps API script'));
                };

                document.head.appendChild(script);
            })
            .catch(error => {
                console.error('Error fetching Google Maps API key:', error);
                isGoogleMapsLoading = false;
                isGoogleMapsLoaded = false;
                
                // Si falla, intentar esperar a que Rails lo cargue
                waitForGoogleMaps(5000)
                    .then(() => {
                        isGoogleMapsLoading = false;
                        resolve();
                    })
                    .catch(() => {
                        reject(error);
                    });
            });
    });

    return loadPromise;
};

export const initializePlaceAutocomplete = (inputElement, onPlaceChanged) => {
    if (!inputElement) {
        console.error('Input element for autocomplete is not defined');
        return null;
    }

    // Verificar que Google Maps esté disponible
    if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('Google Maps API not loaded yet. Call loadGoogleMapsAPI() first.');
        return null;
    }

    try {
        console.log('🗺️ Inicializando Google Places Autocomplete...');
        
        const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
            componentRestrictions: { country: 'co' },
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            types: ['address'],
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry) {
                console.warn('No geometry found for the selected place');
                return;
            }

            const components = place.address_components || [];
            const addressData = {
                formattedAddress: place.formatted_address || place.name,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                barrio: '',
                ciudad: '',
                departamento: '',
                codigoPostal: '',
            };

            components.forEach(component => {
                const types = component.types;
                if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
                    addressData.barrio = component.long_name;
                }
                if (types.includes('locality')) {
                    addressData.ciudad = component.long_name;
                }
                if (types.includes('administrative_area_level_1')) {
                    addressData.departamento = component.long_name;
                }
                if (types.includes('postal_code')) {
                    addressData.codigoPostal = component.long_name;
                }
            });

            console.log('📍 Dirección seleccionada:', addressData);
            onPlaceChanged(addressData);
        });

        return autocomplete;
        
    } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
        return null;
    }
};

/**
 * Obtiene la ruta entre dos puntos usando DirectionsService del API JS de Google.
 * origin/destination pueden ser objetos {lat, lng} o strings aceptados por Google Maps.
 * Retorna una promesa con { distanceKm, durationMin, raw }
 */
export const getDirections = (origin, destination, travelMode = 'two_wheeler') => {
    return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps || !window.google.maps.DirectionsService) {
            return reject(new Error('Google Maps DirectionsService no disponible'));
        }

        try {
            const directionsService = new window.google.maps.DirectionsService();
            const mode = window.google.maps.TravelMode && window.google.maps.TravelMode[travelMode]
                ? window.google.maps.TravelMode[travelMode]
                : window.google.maps.TravelMode.DRIVING;

            directionsService.route({
                origin,
                destination,
                travelMode: mode,
            }, (result, status) => {
                if (status === 'OK' && result && result.routes && result.routes.length > 0) {
                    const leg = result.routes[0].legs[0];
                    const distanceMeters = (leg && leg.distance && leg.distance.value) ? leg.distance.value : 0;
                    const durationSeconds = (leg && leg.duration && leg.duration.value) ? leg.duration.value : 0;

                    resolve({
                        distanceKm: distanceMeters / 1000,
                        durationMin: Math.round(durationSeconds / 60),
                        raw: result,
                    });
                } else {
                    reject(new Error(status || 'No route'));
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

export const calculateDistanceHaversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
};

export const calculateDeliveryCost = (distance, basePrice = 1500, pricePerKm = 1000, increment = 500) => {
    const calculatedPrice = basePrice + (distance * pricePerKm);
    return Math.ceil(calculatedPrice / increment) * increment; // Redondear a múltiplos de `increment`
};

export const calculateEstimatedTime = (distance, preparationTime = 20, averageSpeed = 25) => {
    const travelTime = (distance / averageSpeed) * 60; // Convertir a minutos
    return preparationTime + travelTime;
};