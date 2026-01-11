import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, ImageOff } from 'lucide-react'
import useBusqueda from '../../hooks/useBusqueda'
import { slugify } from '../../utils/slugify'
import LoadingDots from '../../components/ui/LoadingDots'
import ImageWithSkeleton from '../../components/ui/Skeletons/ImageWithSkeleton'
import './Busqueda.css'
import MainLayout from '../../layouts/MainLayout'

export default function Busqueda() {
    const [searchParams, setSearchParams] = useSearchParams()
    const queryParam = searchParams.get('q') || ''
    const [localQuery, setLocalQuery] = useState(queryParam)
    
    const { query, setQuery, results, loading, error, reconnect } = useBusqueda(queryParam)

    useEffect(() => {
        if (queryParam) {
            setQuery(queryParam)
            setLocalQuery(queryParam)
        }
    }, [queryParam, setQuery])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (localQuery.trim()) {
            setSearchParams({ q: localQuery.trim() })
        }
    }

    const fixedPrecio = (precio) => {
        if (precio == null) return ''
        return parseFloat(precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    const getName = (item) => item.nombre || item.name || item.title || item.descripcion || 'Producto'

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
        <MainLayout>
            <section className="page-content">
                <div className="busqueda-page-container">
                    <h1>Resultados de búsqueda</h1>
                    
                    <form className="busqueda-page-form" onSubmit={handleSubmit}>
                        <div className="busqueda-page-input-wrapper">
                            <Search className="busqueda-page-icon" size={20} />
                            <input
                                type="text"
                                className="busqueda-page-input"
                                value={localQuery}
                                onChange={(e) => setLocalQuery(e.target.value)}
                                placeholder="Buscar productos..."
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="busqueda-page-button">
                            Buscar
                        </button>
                    </form>

                    {query && (
                        <div className="busqueda-page-query">
                            Búsqueda: <strong>"{query}"</strong>
                        </div>
                    )}

                    {loading && (
                        <div className="busqueda-page-loading">
                            <LoadingDots text='Buscando productos' loading={true} color='var(--background-color)'/>
                        </div>
                    )}

                    {error && (
                        <div className="busqueda-page-error">
                            <p>{error.message || String(error)}</p>
                            <button onClick={reconnect} className="busqueda-page-retry">
                                Reintentar
                            </button>
                        </div>
                    )}

                    {!loading && !error && results.productos && results.productos.length > 0 && (
                        <div className="busqueda-page-results">
                            <div className="busqueda-page-count">
                                {results.productos.length} {results.productos.length === 1 ? 'resultado' : 'resultados'}
                            </div>
                            
                            <div className="busqueda-page-grid">
                                {results.productos.map((p, i) => {
                                    const productoId = p.id || p._id || p.producto_id || p.productoId || i
                                    const productoNombre = p.nombre || p.name || p.title || ''
                                    const categoriaId = p.grupo_id || p.grupoId || p.group_id || p.categoria_id || p.categoriaId || p.categoria || '0'
                                    
                                    const grupoMatch = (results.grupos || []).find(
                                        (g) => String(g.id) === String(categoriaId) || String(g._id) === String(categoriaId) || String(g.grupo_id) === String(categoriaId)
                                    )
                                    const categoriaNombre = (grupoMatch && (grupoMatch.nombre || grupoMatch.name)) || p.categoria_nombre || p.categoriaNombre || p.type || 'categoria'
                                    
                                    const categoriaSlug = `${categoriaId}-${slugify(String(categoriaNombre))}`
                                    const productoSlug = `${productoId}-${slugify(String(productoNombre || 'producto'))}`
                                    const to = `/categoria/${categoriaSlug}/producto/${productoSlug}`

                                    return (
                                        <Link to={to} className="busqueda-page-card" key={productoId}>
                                            <div className="busqueda-page-card-image">
                                                {p.imagen_url ? (
                                                    <ImageWithSkeleton 
                                                        src={getImageUrl(p.imagen_url)} 
                                                        alt={getName(p)} 
                                                        className="busqueda-page-img"
                                                    />
                                                ) : (
                                                    <div className="busqueda-page-card-no-image"><ImageOff />Sin imagen</div>
                                                )}
                                            </div>
                                            <div className="busqueda-page-card-info">
                                                <h3 className="busqueda-page-card-title">{getName(p)}</h3>
                                                {p.precio != null && (
                                                    <p className="busqueda-page-card-price">{fixedPrecio(p.precio)}</p>
                                                )}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {!loading && !error && query && (!results.productos || results.productos.length === 0) && (
                        <div className="busqueda-page-empty">
                            <Search size={64} />
                            <h2>No se encontraron productos</h2>
                            <p>No hay resultados para "{query}"</p>
                            <p>Intenta con otras palabras clave</p>
                        </div>
                    )}
                </div>
            </section>
        </MainLayout>
    )
}
