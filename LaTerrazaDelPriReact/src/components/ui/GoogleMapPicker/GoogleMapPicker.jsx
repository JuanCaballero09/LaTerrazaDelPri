import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps, reverseGeocode } from '../../../utils/googleMapsLoader';
import './GoogleMapPicker.css';

const GoogleMapPicker = ({ 
    center = { lat: 10.9685, lng: -74.7813 }, // Barranquilla por defecto
    zoom = 15,
    onLocationChange,
    height = '450px'
    }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const { isLoaded, error, google } = useGoogleMaps();

    // Mostrar error si hay uno
    useEffect(() => {
        if (error) {
        console.error('❌ Error cargando Google Maps:', error);
        }
    }, [error]);

    // Inicializar el mapa
    useEffect(() => {
        if (!isLoaded || !google || !mapRef.current || mapInstanceRef.current) return;

        try {
        // Crear mapa
        const map = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
        });

        mapInstanceRef.current = map;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMapReady(true);

        console.log('✅ Google Maps inicializado');
        } catch (error) {
        console.error('❌ Error inicializando Google Maps:', error);
        }
    }, [isLoaded, google, center, zoom]);

    // Listener cuando el mapa se mueve
    useEffect(() => {
        if (!isMapReady || !mapInstanceRef.current) return;

        const map = mapInstanceRef.current;
        let debounceTimer;

        // Cuando el centro del mapa cambia
        const centerChangedListener = map.addListener('center_changed', () => {
        const newCenter = map.getCenter();
        const lat = newCenter.lat();
        const lng = newCenter.lng();

        // Notificar cambio de coordenadas inmediatamente
        if (onLocationChange) {
            onLocationChange({ lat, lng });
        }
        });

        // Cuando el mapa deja de moverse (para geocodificación inversa)
        const idleListener = map.addListener('idle', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const center = map.getCenter();
            const lat = center.lat();
            const lng = center.lng();

            try {
            const addressData = await reverseGeocode(lat, lng);
            
            // Notificar con datos completos de dirección
            if (onLocationChange) {
                onLocationChange({
                lat,
                lng,
                ...addressData
                });
            }

            console.log('🔍 Geocodificación inversa:', addressData);
            } catch (error) {
            console.error('❌ Error en geocodificación inversa:', error);
            }
        }, 500); // Esperar 500ms después de que el mapa deje de moverse
        });

        // Cleanup
        return () => {
        if (centerChangedListener) google.maps.event.removeListener(centerChangedListener);
        if (idleListener) google.maps.event.removeListener(idleListener);
        clearTimeout(debounceTimer);
        };
    }, [isMapReady, onLocationChange, google]);

    // Método público para actualizar el centro del mapa
    useEffect(() => {
        if (mapInstanceRef.current && center) {
        mapInstanceRef.current.setCenter(center);
        }
    }, [center]);

    if (!isLoaded) {
        return (
        <div className="map-loading" style={{ height }}>
            <div className="loading-spinner"></div>
            <p>{error ? 'Error al cargar Google Maps' : 'Cargando Google Maps...'}</p>
            {error && <p className="error-text">Por favor, recarga la página</p>}
        </div>
        );
    }

    return (
        <div className="google-map-picker">
        <div 
            ref={mapRef} 
            className="map-container"
            style={{ height }}
        />
        <div className="map-pin">📍</div>
        </div>
    );
};

export default GoogleMapPicker;
