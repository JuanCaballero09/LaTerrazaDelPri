import axios from './axios';

// ===== ENDPOINTS PÚBLICOS =====
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

// ===== ENDPOINTS DASHBOARD (ADMIN) =====

// GET /api/v1/dashboard/sedes
export const getSedesRequest = async (params = {}) => {
    const response = await axios.get('/dashboard/sedes', { params });
    return response.data;
};

// GET /api/v1/dashboard/sedes/:id
export const getSedeRequest = async (id) => {
    const response = await axios.get(`/dashboard/sedes/${id}`);
    return response.data;
};

// POST /api/v1/dashboard/sedes
export const createSedeRequest = async (sedeData) => {
    const response = await axios.post('/dashboard/sedes', { sede: sedeData });
    return response.data;
};

// PATCH /api/v1/dashboard/sedes/:id
export const updateSedeRequest = async (id, sedeData) => {
    const response = await axios.patch(`/dashboard/sedes/${id}`, { sede: sedeData });
    return response.data;
};

// DELETE /api/v1/dashboard/sedes/:id
export const deleteSedeRequest = async (id) => {
    await axios.delete(`/dashboard/sedes/${id}`);
};

// PATCH /api/v1/dashboard/sedes/:id/toggle_activo
export const toggleSedeActivoRequest = async (id) => {
    const response = await axios.patch(`/dashboard/sedes/${id}/toggle_activo`);
    return response.data;
};