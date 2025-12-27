import { useState, useEffect } from 'react';
import { fetchSedes, fetchNearestSede } from '../api/sedes.api';

export default function useSedes() {
    const [sedes, setSedes] = useState([]);
    const [nearestSede, setNearestSede] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSedes = async () => {
            try {
                const data = await fetchSedes();
                // Mantener solo sedes activas
                const active = Array.isArray(data) ? data.filter(s => s.activo === true || s.activo === 'true') : [];
                setSedes(active);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadSedes();
    }, []);

    const getNearestSede = async (latitude, longitude) => {
        try {
            setLoading(true);
            const data = await fetchNearestSede(latitude, longitude);
            setNearestSede(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { sedes, nearestSede, loading, error, getNearestSede };
};