import api from './axios'

export const buscarProductos = async (query) => {
    try {
        const response = await api.get('/buscar', {
            params: { q: query }
        })
        if (response.status !== 200) {
            throw new Error('Error en la búsqueda de productos')
        }

        const data = response.data

        // Aceptar dos formatos: array (legacy) o objeto con { productos, grupos, total }
        if (!data) {
            throw new Error('Respuesta de búsqueda vacía')
        }

        if (Array.isArray(data)) {
            // legacy: devolver como productos
            return {
                productos: data,
                grupos: [],
                total: data.length
            }
        }

        // Validar objeto esperado
        const productos = Array.isArray(data.productos) ? data.productos : []
        const grupos = Array.isArray(data.grupos) ? data.grupos : []
        const total = typeof data.total === 'number' ? data.total : (productos.length + grupos.length)

        return { productos, grupos, total }

    } catch (error) {
        console.error('Error buscando productos:', error)
        throw error
    }
}