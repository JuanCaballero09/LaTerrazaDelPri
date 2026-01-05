import { useEffect, useState } from 'react';
import { fetchGoogleMapKey } from '../api/config.api';

let googleMapsLoaded = false;
let googleMapsLoading = false;
let cachedApiKey = null;
const loadCallbacks = [];

// Obtener API key desde el backend
const getApiKey = async () => {
    if (cachedApiKey) {
        return cachedApiKey;
    }

    try {
        const response = await fetchGoogleMapKey();
        cachedApiKey = response.google_map_key;
        return cachedApiKey;
    } catch (error) {
        console.error('❌ Error obteniendo Google Maps API key:', error);
        throw new Error('No se pudo obtener la API key de Google Maps');
    }
    };

    export const loadGoogleMaps = async () => {
    // Si ya está cargado, resolver inmediatamente
    if (googleMapsLoaded && window.google) {
        return window.google;
    }

    // Si está en proceso de carga, esperar
    if (googleMapsLoading) {
        return new Promise((resolve, reject) => {
        loadCallbacks.push({ resolve, reject });
        });
    }

    googleMapsLoading = true;

    try {
        // Obtener API key del backend
        const apiKey = await getApiKey();

        return new Promise((resolve, reject) => {
        // Crear el script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            googleMapsLoaded = true;
            googleMapsLoading = false;
            console.log('✅ Google Maps cargado exitosamente');
            resolve(window.google);
            
            // Resolver todos los callbacks pendientes
            loadCallbacks.forEach(cb => cb.resolve(window.google));
            loadCallbacks.length = 0;
        };

        script.onerror = (error) => {
            googleMapsLoading = false;
            console.error('❌ Error cargando Google Maps script');
            reject(error);
            
            // Rechazar todos los callbacks pendientes
            loadCallbacks.forEach(cb => cb.reject(error));
            loadCallbacks.length = 0;
        };

        document.head.appendChild(script);
        });
    } catch (error) {
        googleMapsLoading = false;
        throw error;
    }
    };

    // Hook personalizado para cargar Google Maps
    export const useGoogleMaps = () => {
    const [isLoaded, setIsLoaded] = useState(googleMapsLoaded && !!window.google);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (googleMapsLoaded && window.google) {
        setIsLoaded(true);
        return;
        }

        loadGoogleMaps()
        .then(() => {
            setIsLoaded(true);
        })
        .catch(err => {
            console.error('Error loading Google Maps:', err);
            setError(err);
        });
    }, []);

    return {
        isLoaded,
        error,
        google: window.google
    };
    };

    // Geocodificar dirección a coordenadas
    export const geocodeAddress = async (address) => {
    if (!window.google) {
        throw new Error('Google Maps no está cargado');
    }

    const geocoder = new window.google.maps.Geocoder();

    return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address,
            address_components: results[0].address_components
            });
        } else {
            reject(new Error(`Geocodificación falló: ${status}`));
        }
        });
    });
    };

    // Geocodificación inversa: coordenadas a dirección
    export const reverseGeocode = async (lat, lng) => {
    if (!window.google) {
        throw new Error('Google Maps no está cargado');
    }

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve, reject) => {
        geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const addressComponents = results[0].address_components;
            
            // Extraer componentes
            let direccion = '';
            let numero = '';
            let barrio = '';
            let municipio = '';
            let departamento = '';

            addressComponents.forEach(component => {
            const types = component.types;
            
            if (types.includes('street_number')) {
                numero = component.long_name;
            }
            if (types.includes('route')) {
                direccion = component.long_name;
            }
            if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
                barrio = component.long_name;
            }
            if (types.includes('neighborhood') && !barrio) {
                barrio = component.long_name;
            }
            if (types.includes('locality')) {
                municipio = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
                departamento = component.long_name;
            }
            });

            // Construir dirección completa
            let direccionCompleta = direccion;
            if (numero) {
            direccionCompleta = `${direccion} ${numero}`;
            }

            resolve({
            direccion: direccionCompleta,
            barrio,
            municipio,
            departamento,
            formatted_address: results[0].formatted_address
            });
        } else {
            reject(new Error(`Geocodificación inversa falló: ${status}`));
        }
        });
    });
};
