import { useState, useEffect } from 'react';
import GoogleMapPicker from '../../../components/ui/GoogleMapPicker/GoogleMapPicker';
import { geocodeAddress } from '../../../utils/googleMapsLoader';
import './Dashboard.css';

const DEPARTAMENTOS = [
    'Atlántico',
    'Bogotá D.C.',
    'Antioquia',
    'Valle del Cauca',
];

const SedeForm = ({ sede, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        departamento: '',
        municipio: '',
        barrio: '',
        direccion: '',
        latitud: null,
        longitud: null,
        activo: true
    });

    const [errors, setErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 10.9685, lng: -74.7813 });
    const [geocodeTimer, setGeocodeTimer] = useState(null);

    // Cargar datos de la sede si está editando
    useEffect(() => {
        if (sede) {
        setFormData({
            nombre: sede.nombre || '',
            telefono: sede.telefono || '',
            departamento: sede.departamento || '',
            municipio: sede.municipio || '',
            barrio: sede.barrio || '',
            direccion: sede.direccion || '',
            latitud: sede.latitud || null,
            longitud: sede.longitud || null,
            activo: sede.activo !== undefined ? sede.activo : true
        });

        // Actualizar centro del mapa si hay coordenadas
        if (sede.latitud && sede.longitud) {
            setMapCenter({ lat: parseFloat(sede.latitud), lng: parseFloat(sede.longitud) });
        }
        }
    }, [sede]);

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
        ...prev,
        [name]: newValue
        }));

        // Si cambia un campo de dirección, programar geocodificación
        if (['direccion', 'municipio', 'departamento', 'barrio'].includes(name)) {
        if (geocodeTimer) {
            clearTimeout(geocodeTimer);
        }

        const timer = setTimeout(() => {
            handleGeocodeFromAddress();
        }, 1500); // Esperar 1.5 segundos después de que el usuario deje de escribir

        setGeocodeTimer(timer);
        }
    };

    // Manejar cambios de teléfono (solo números, máximo 10 dígitos)
    const handleTelefonoChange = (e) => {
        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, telefono: cleaned }));
    };

    // Geocodificar desde la dirección del formulario
    const handleGeocodeFromAddress = async () => {
        const { direccion, municipio, departamento, barrio } = formData;

        if (!direccion || !municipio) return;

        // Construir dirección completa
        let fullAddress = direccion;
        if (barrio) fullAddress += ', ' + barrio;
        fullAddress += ', ' + municipio;
        if (departamento) fullAddress += ', ' + departamento;
        fullAddress += ', Colombia';

        try {
        console.log('🔍 Geocodificando:', fullAddress);
        const result = await geocodeAddress(fullAddress);
        
        setFormData(prev => ({
            ...prev,
            latitud: result.lat,
            longitud: result.lng
        }));

        setMapCenter({ lat: result.lat, lng: result.lng });
        console.log('✅ Dirección geocodificada:', result);
        } catch (error) {
        console.log('⚠️ No se pudo geocodificar la dirección:', error.message);
        }
    };

    // Manejar cambios desde el mapa
    const handleMapLocationChange = (locationData) => {
        const { lat, lng, direccion, barrio, municipio, departamento } = locationData;

        // Actualizar coordenadas siempre
        setFormData(prev => ({
        ...prev,
        latitud: lat,
        longitud: lng
        }));

        // Actualizar campos de dirección solo si vienen del geocoder (geocodificación inversa)
        if (direccion !== undefined) {
        setFormData(prev => ({
            ...prev,
            direccion: direccion || prev.direccion,
            barrio: barrio || prev.barrio,
            municipio: municipio || prev.municipio,
            departamento: departamento || prev.departamento
        }));
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = [];

        if (!formData.nombre.trim()) newErrors.push('El nombre es requerido');
        if (!formData.departamento.trim()) newErrors.push('El departamento es requerido');
        if (!formData.municipio.trim()) newErrors.push('El municipio es requerido');
        if (!formData.direccion.trim()) newErrors.push('La dirección es requerida');
        
        if (formData.telefono && formData.telefono.length !== 10) {
        newErrors.push('El teléfono debe tener exactamente 10 dígitos');
        }

        return newErrors;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
        }

        setIsSubmitting(true);
        setErrors([]);

        try {
        // Preparar datos para enviar
        const dataToSubmit = {
            nombre: formData.nombre.trim(),
            telefono: formData.telefono || null,
            departamento: formData.departamento.trim(),
            municipio: formData.municipio.trim(),
            barrio: formData.barrio.trim() || null,
            direccion: formData.direccion.trim(),
            latitud: formData.latitud,
            longitud: formData.longitud,
            activo: formData.activo
        };

        await onSubmit(dataToSubmit);
        } catch (err) {
        const errorMessages = err.response?.data?.errors || ['Error al guardar la sede'];
        setErrors(errorMessages);
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="sede-form-container">
        {/* Errores */}
        {errors.length > 0 && (
            <div className="error-messages">
            <h4>❌ {errors.length === 1 ? 'Error' : 'Errores'} encontrados:</h4>
            <ul>
                {errors.map((error, index) => (
                <li key={index}>{error}</li>
                ))}
            </ul>
            </div>
        )}

        {/* Mapa */}
        <div className="map-section">
            <h3>📍 Ubicación de la Sede</h3>
            <p className="map-instruction">
            Arrastra el mapa para ubicar el marcador en la ubicación exacta de la sede
            </p>
            <GoogleMapPicker
            center={mapCenter}
            zoom={15}
            onLocationChange={handleMapLocationChange}
            height="450px"
            />
            <p className="map-hint">
            💡 También puedes ingresar la dirección abajo y el mapa se actualizará automáticamente
            </p>
        </div>

        {/* Campos del formulario */}
        <div className="dashboard-modal-form">
            <div className="dashboard-form-grid">
            <div className="dashboard-form-group">
                <label htmlFor="nombre">Nombre de la Sede *</label>
                <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Sede Principal"
                required
                />
            </div>

            <div className="dashboard-form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleTelefonoChange}
                placeholder="Ej: 3001234567 (10 dígitos)"
                maxLength={10}
                />
            </div>
            </div>

            <div className="dashboard-form-grid">
            <div className="dashboard-form-group">
                <label htmlFor="departamento">Departamento *</label>
                <input
                type="text"
                id="departamento"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className="form-control"
                placeholder="Ej: Atlántico"
                list="departamentos-list"
                required
                />
                <datalist id="departamentos-list">
                {DEPARTAMENTOS.map(dep => (
                    <option key={dep} value={dep} />
                ))}
                </datalist>
            </div>

            <div className="form-group">
                <label htmlFor="municipio">Municipio *</label>
                <input
                type="text"
                id="municipio"
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                placeholder="Ej: Barranquilla"
                required
                />
            </div>
            </div>

            <div className="dashboard-form-group full-width">
            <label htmlFor="barrio">Barrio</label>
            <input
                type="text"
                id="barrio"
                name="barrio"
                value={formData.barrio}
                onChange={handleChange}
                placeholder="Ej: Ciudadela Metropolitana"
            />
            </div>

            <div className="dashboard-form-group full-width">
            <label htmlFor="direccion">Dirección Completa *</label>
            <textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows={2}
                placeholder="Ej: Calle 55B #7A-28"
                required
            />
            <small style={{color: '#666', fontSize: '0.85rem', fontStyle: 'italic'}}>
                Esta dirección se usará para geocodificar automáticamente
            </small>
            </div>

            <div className="dashboard-form-grid">
            <div className="dashboard-form-group">
                <label htmlFor="latitud">Latitud</label>
                <input
                type="number"
                id="latitud"
                name="latitud"
                value={formData.latitud || ''}
                placeholder="Se calculará automáticamente"
                readOnly
                step="0.000001"
                />
                <small style={{color: '#666', fontSize: '0.85rem', fontStyle: 'italic'}}>Se actualiza automáticamente al mover el mapa</small>
            </div>

            <div className="dashboard-form-group">
                <label htmlFor="longitud">Longitud</label>
                <input
                type="number"
                id="longitud"
                name="longitud"
                value={formData.longitud || ''}
                placeholder="Se calculará automáticamente"
                readOnly
                step="0.000001"
                />
                <small style={{color: '#666', fontSize: '0.85rem', fontStyle: 'italic'}}>Se actualiza automáticamente al mover el mapa</small>
            </div>
            </div>

            <div className="dashboard-form-group full-width">
            <label className="dashboard-checkbox-label">
                <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                />
                <span>Sede Activa</span>
            </label>
            </div>
        </div>

        {/* Botones */}
        <div className="dashboard-modal-actions">
            <button
            type="submit"
            className="dashboard-btn-primary"
            disabled={isSubmitting}
            >
            {isSubmitting ? 'Guardando...' : (sede ? 'Actualizar Sede' : 'Crear Sede')}
            </button>
            <button
            type="button"
            className="dashboard-btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            >
            Cancelar
            </button>
        </div>
        </form>
    );
};

export default SedeForm;
