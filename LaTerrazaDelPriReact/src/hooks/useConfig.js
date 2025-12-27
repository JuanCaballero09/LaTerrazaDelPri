import { useState, useEffect } from 'react';
import { fetchGoogleMapKey } from '../api/config.api';

export const useConfig = () => {
    const [googleMapKey, setGoogleMapKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadGoogleMapKey = async () => {
            try {
                const data = await fetchGoogleMapKey();
                setGoogleMapKey(data.google_map_key);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadGoogleMapKey();
    }, []);

    return { googleMapKey, loading, error };
};