import axios from './axios';

export const fetchSedes = async () => {
    try {
        const response = await axios.get('/sedes');
        console.log('✅ Sedes cargadas:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching sedes:', error);
        throw error;
    }
};

export const fetchNearestSede = async (latitude, longitude) => {
    try {
        const response = await axios.get(`/sedes?lat=${latitude}&lng=${longitude}`);
        console.log('✅ Sede más cercana:', response.data);
        return response.data[0]; // Retornar la primera sede (la más cercana)
    } catch (error) {
        console.error('❌ Error fetching nearest sede:', error);
        throw error;
    }
};