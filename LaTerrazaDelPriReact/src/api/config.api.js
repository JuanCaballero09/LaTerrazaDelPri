import api from './axios';

export const fetchGoogleMapKey = async () => {
    try {
        const response = await api.get('/config/google_map_key');
        return response.data;
    } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        throw error;
    }
};