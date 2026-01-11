import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import useBusqueda from '../../../hooks/useBusqueda'
import { slugify } from '../../../utils/slugify'
import LoadingDots from '../LoadingDots'
import ImageWithSkeleton from '../Skeletons/ImageWithSkeleton'
import './BusquedaBar.css'

// eslint-disable-next-line no-unused-vars
export default function BusquedaBar({ isOpen, onClose }) {
    const { query, setQuery, results, loading, error, reconnect, clear } = useBusqueda('')
    const wrapperRef = useRef(null)
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate()

    useEffect(() => {
        const handleOutside = (e) => {
            if (!wrapperRef.current) return
            if (!wrapperRef.current.contains(e.target)) {
                // Cerrar el panel si se hace clic fuera
                if (onClose) onClose()
            }
        }

        const handleKey = (e) => {
            if (e.key === 'Escape') {
                clear()
                if (onClose) onClose()
            }
        }

        document.addEventListener('pointerdown', handleOutside)
        document.addEventListener('keydown', handleKey)
        return () => {
            document.removeEventListener('pointerdown', handleOutside)
            document.removeEventListener('keydown', handleKey)
        }
    }, [query, clear, onClose])

    const handleChange = (e) => setQuery(e.target.value)
    
    const handleResultClick = () => {
        clear()
        if (onClose) onClose()
    }
    
    const fixedPrecio = (precio) => {
        if (precio == null) return ''
        return parseFloat(precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    const getName = (item) => item.nombre || item.name || item.title || item.descripcion || JSON.stringify(item).slice(0, 50)

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null
        // Si ya es una URL completa, devolverla tal cual
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath
        }
        // Si es una ruta relativa, construir URL completa
        const origin = window.location.origin
        return `${origin}${imagePath}`
    }

    return (
        <div className="busqueda-panel" ref={wrapperRef}>
            <div className="busqueda-panel-content">
                <div className="busqueda-header">
                    <h3>Buscar Productos</h3>
                    <button className="busqueda-close" onClick={onClose} aria-label="Cerrar búsqueda">
                        <X size={24} />
                    </button>
                </div>
                <input
                    className="busqueda-input"
                    value={query}
                    onChange={handleChange}
                    placeholder="Buscar productos..."
                    aria-label="Buscar productos"
                    autoFocus
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
                                <div className="productos-section">
                                    <div className="productos-header">
                                        <h4>PRODUCTOS</h4>
                                    </div>
                                    <div className="productos-list-compact">
                                    {results.productos.slice(0, 3).map((p, i) => {
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
                                            <Link to={to} className="busqueda-card-compact" key={productoId} role="listitem" onClick={handleResultClick}>
                                                {p.imagen_url && (
                                                    <div className="busqueda-card-thumb">
                                                        <ImageWithSkeleton 
                                                            src={getImageUrl(p.imagen_url)} 
                                                            alt={getName(p)} 
                                                            className="busqueda-thumb-img"
                                                        />
                                                    </div>
                                                )}
                                                <div className="busqueda-card-details">
                                                    <div className="busqueda-card-name">{getName(p)}</div>
                                                    {p.precio != null && <div className="busqueda-card-price">{fixedPrecio(p.precio)}</div>}
                                                </div>
                                            </Link>
                                        )
                                    })}
                                    </div>
                                    
                                    <Link 
                                        to={`/busqueda?q=${encodeURIComponent(query)}`} 
                                        className="busqueda-ver-todos"
                                        onClick={() => {
                                            if (onClose) onClose()
                                        }}
                                    >
                                        <span>Buscar "{query}"</span>
                                        <ArrowRight size={20} />
                                    </Link>
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
        </div>
    )
}
