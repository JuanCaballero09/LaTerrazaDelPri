import { useState, useEffect } from 'react';
import { getDashboardStats, getRecentOrders } from '../../api/dashboard.api';

export function useDashboardStatsEnhanced(period = 'month') {
    const [stats, setStats] = useState({
        // Ventas
        ventasHoy: 0,
        ventasSemana: 0,
        ventasMes: 0,
        ventasAnio: 0,
        
        // Órdenes
        ordenesHoy: 0,
        ordenesSemana: 0,
        ordenesMes: 0,
        ordenesPendientes: 0,
        ordenesPagadas: 0,
        ordenesTomadas: 0,
        ordenesFinalizadas: 0,
        ordenesCanceladas: 0,
        
        // Productos
        productosActivos: 0,
        productosInactivos: 0,
        totalProductos: 0,
        
        // Usuarios
        usuariosTotal: 0,
        usuariosActivos: 0,
        usuariosNuevosHoy: 0,
        usuariosNuevosMes: 0,
        
        // Métodos de pago (PSE no implementado)
        pagosTarjeta: 0,
        pagosNequi: 0,
        pagosEfectivo: 0,
        
        // Promedios
        ticketPromedio: 0,
        ordenesPromedioDia: 0,
        
        // Top productos
        topProductos: [],
        
        // Cupones
        cuponesUsados: 0,
        descuentoTotal: 0,
        
        // Sedes
        sedesActivas: 0,
        
        // Información del servidor
        serverInfo: null,
        
        // Gráficas (datos por día)
        ventasPorDia: [],
        ordenesPorDia: [],
        ordenesPorEstado: { labels: [], data: [] },
        ventasPorMetodoPago: { labels: [], data: [] }
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Obtener estadísticas del dashboard
            const statsResponse = await getDashboardStats();
            const statsData = statsResponse.data;
            
            // Obtener órdenes recientes
            const ordersResponse = await getRecentOrders(10);
            const ordersData = ordersResponse.data;

            setStats({
                // Ventas
                ventasHoy: statsData.ventas_hoy || 0,
                ventasSemana: statsData.ventas_semana || 0,
                ventasMes: statsData.ventas_mes || 0,
                ventasAnio: statsData.ventas_anio || 0,
                
                // Órdenes
                ordenesHoy: statsData.ordenes_hoy || 0,
                ordenesSemana: statsData.ordenes_semana || 0,
                ordenesMes: statsData.ordenes_mes || 0,
                ordenesPendientes: statsData.ordenes_pendientes || 0,
                ordenesPagadas: statsData.ordenes_pagadas || 0,
                ordenesTomadas: statsData.ordenes_tomadas || 0,
                ordenesFinalizadas: statsData.ordenes_finalizadas || 0,
                ordenesCanceladas: statsData.ordenes_canceladas || 0,
                
                // Productos
                productosActivos: statsData.productos_activos || 0,
                productosInactivos: statsData.productos_inactivos || 0,
                totalProductos: statsData.total_productos || 0,
                
                // Usuarios
                usuariosTotal: statsData.usuarios_total || 0,
                usuariosActivos: statsData.usuarios_activos || 0,
                usuariosNuevosHoy: statsData.usuarios_nuevos_hoy || 0,
                usuariosNuevosMes: statsData.usuarios_nuevos_mes || 0,
                
                // Métodos de pago (PSE no implementado)
                pagosTarjeta: statsData.pagos_tarjeta || 0,
                pagosNequi: statsData.pagos_nequi || 0,
                pagosEfectivo: statsData.pagos_efectivo || 0,
                
                // Promedios
                ticketPromedio: statsData.ticket_promedio || 0,
                ordenesPromedioDia: statsData.ordenes_promedio_dia || 0,
                
                // Top productos
                topProductos: statsData.top_productos || [],
                
                // Cupones
                cuponesUsados: statsData.cupones_usados || 0,
                descuentoTotal: statsData.descuento_total || 0,
                
                // Sedes
                sedesActivas: statsData.sedes_activas || 0,
                
                // Información del servidor
                serverInfo: statsData.server_info || null,
                
                // Gráficas
                ventasPorDia: statsData.ventas_por_dia || [],
                ordenesPorDia: statsData.ordenes_por_dia || [],
                ordenesPorEstado: statsData.ordenes_por_estado || { labels: [], data: [] },
                ventasPorMetodoPago: statsData.ventas_por_metodo_pago || { labels: [], data: [] }
            });

            setRecentOrders(ordersData);
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
            setError(err.response?.data?.error || 'Error al cargar estadísticas del dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [period]);

    return {
        stats,
        recentOrders,
        loading,
        error,
        retry: fetchStats,
        refetch: fetchStats
    };
}
