import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useBusqueda from '../../../hooks/useBusqueda'
import { slugify } from '../../../utils/slugify'
import LoadingDots from '../LoadingDots'
import './BusquedaBar.css'

export default function BusquedaBar() {
    const { query, setQuery, results, loading, error, reconnect, clear } = useBusqueda('')
    const wrapperRef = useRef(null)

    useEffect(() => {
        const handleOutside = (e) => {
            if (!wrapperRef.current) return
            if (!wrapperRef.current.contains(e.target)) {
                // si hay texto activo, limpiar la búsqueda
                if (query && query.trim() !== '') {
                    clear()
                }
            }
        }

        const handleKey = (e) => {
            if (e.key === 'Escape') {
                clear()
            }
        }

        document.addEventListener('pointerdown', handleOutside)
        document.addEventListener('keydown', handleKey)
        return () => {
            document.removeEventListener('pointerdown', handleOutside)
            document.removeEventListener('keydown', handleKey)
        }
    }, [query, clear])

    const handleChange = (e) => setQuery(e.target.value)
    
    const fixedPrecio = (precio) => {
        if (precio == null) return ''
        return parseFloat(precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    const getName = (item) => item.nombre || item.name || item.title || item.descripcion || JSON.stringify(item).slice(0, 50)

    return (
        <div className="busqueda-bar" ref={wrapperRef}>
            <input
                className="busqueda-input"
                value={query}
                onChange={handleChange}
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
            />

            {/* No mostrar paneles si el campo está vacío */}
            {query.trim() !== '' && (
                <>
                    {loading && <div className="busqueda-status"><LoadingDots text='Buscando' loading={false} /></div>}

                    {error && (
                        <div className="busqueda-error">
                            {error.message || String(error)}
                            <div>
                                <button className="busqueda-retry" onClick={reconnect} type="button">Reintentar</button>
                                <button className="busqueda-clear" onClick={clear} type="button">Limpiar</button>
                            </div>
                        </div>
                    )}

                    {!loading && ((results.productos && results.productos.length > 0) || (results.grupos && results.grupos.length > 0)) && (
                        <div className="busqueda-results" role="list">
                            {results.productos && results.productos.length > 0 && (
                                <div className="productos-list">
                                    {results.productos.map((p, i) => {
                                        const productoId = p.id || p._id || p.producto_id || p.productoId || i
                                        const productoNombre = p.nombre || p.name || p.title || ''

                                        // Obtener categoría/grupo desde distintos campos (la API de búsqueda usa `grupo_id`)
                                        const categoriaId = p.grupo_id || p.grupoId || p.group_id || p.categoria_id || p.categoriaId || p.categoria || '0'

                                        // Intentar encontrar el nombre de la categoría en los grupos devueltos por la búsqueda
                                        const grupoMatch = (results.grupos || []).find(
                                            (g) => String(g.id) === String(categoriaId) || String(g._id) === String(categoriaId) || String(g.grupo_id) === String(categoriaId)
                                        )
                                        // Usar nombre del grupo si existe; si no, usar el tipo del producto o un fallback genérico
                                        const categoriaNombre = (grupoMatch && (grupoMatch.nombre || grupoMatch.name)) || p.categoria_nombre || p.categoriaNombre || p.type || 'categoria'

                                        const categoriaSlug = `${categoriaId}-${slugify(String(categoriaNombre))}`
                                        const productoSlug = `${productoId}-${slugify(String(productoNombre || 'producto'))}`

                                        const to = `/categoria/${categoriaSlug}/producto/${productoSlug}`

                                        return (
                                            <Link to={to} className="busqueda-card" key={productoId} role="listitem">
                                                <div className="busqueda-card-title">{getName(p)}</div>
                                                {p.precio != null && <div className="busqueda-card-price">{fixedPrecio(p.precio)}</div>}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && !error && !((results.productos && results.productos.length > 0) || (results.grupos && results.grupos.length > 0)) && (
                        <div className="busqueda-noresults">No hay productos con ese nombre.</div>
                    )}
                </>
            )}
        </div>
    )
}
