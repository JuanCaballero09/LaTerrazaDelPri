import { useState, useEffect } from 'react';
import { getAllUsers, updateUserAdmin } from '../../api/dashboard-users.api';

export function useDashboardUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            setError(err.response?.data?.error || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userId, userData) => {
        try {
            const updatedUser = await updateUserAdmin(userId, userData);
            
            // Actualizar en el estado local
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? updatedUser : user
                )
            );

            return { success: true };
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
            const errorMessage = err.response?.data?.error || 'Error al actualizar usuario';
            return { success: false, error: errorMessage };
        }
    };

    const toggleActivo = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return { success: false, error: 'Usuario no encontrado' };

        return await updateUser(userId, { activo: !user.activo });
    };

    const changeRol = async (userId, newRol) => {
        return await updateUser(userId, { rol: newRol });
    };

    // Filtrar usuarios
    const filterUsers = (searchTerm, filterRol, filterActivo) => {
        return users.filter(user => {
            // Filtro de búsqueda
            const matchesSearch = !searchTerm || 
                user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.telefono?.includes(searchTerm);

            // Filtro de rol
            const matchesRol = filterRol === 'all' || user.rol === filterRol;

            // Filtro de estado activo
            const matchesActivo = filterActivo === 'all' || 
                (filterActivo === 'activo' && user.activo) ||
                (filterActivo === 'inactivo' && !user.activo);

            return matchesSearch && matchesRol && matchesActivo;
        });
    };

    // Obtener estadísticas
    const getStats = () => {
        return {
            total: users.length,
            activos: users.filter(u => u.activo).length,
            inactivos: users.filter(u => !u.activo).length,
            admins: users.filter(u => u.rol === 'admin').length,
            empleados: users.filter(u => u.rol === 'empleado').length,
            domiciliarios: users.filter(u => u.rol === 'domiciliario').length,
            clientes: users.filter(u => u.rol === 'cliente').length,
        };
    };

    return {
        users,
        loading,
        error,
        updateUser,
        toggleActivo,
        changeRol,
        filterUsers,
        getStats,
        refetch: fetchUsers
    };
}
