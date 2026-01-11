

import { useRef } from 'react'
import ProductoCard from './ProductoCard'
import './MenuPage.css'
import { useCategoriaIndex } from '../../hooks/Categorias/useCategoriaIndex'
import CardSkeleton from '../ui/Skeletons/CardSkeleton'


export default function MenuPage({ productos = [], loading = false }) {
    const groupRefs = useRef({})
    const { categorias = [] } = useCategoriaIndex()

    if (loading) {
        const skeletonGroups = [1,2,3]
        return (
            <div className="menu-page">
                {skeletonGroups.map(gid => (
                    <section key={gid} className="menu-group">
                        <h2 className="menu-group-title skeleton">Cargando categoría</h2>
                        <div className="slider">
                            <button className="slider-btn prev" aria-hidden>‹</button>
                            <div className="slider-track" style={{justifyContent: 'center'}}>
                                {[0,1,2,3,4].map(i => (
                                    
                                    <ProductoCard loading key={`s-${gid}-${i}`} />
                                ))}
                            </div>
                            <button className="slider-btn next" aria-hidden>›</button>
                        </div>
                    </section>
                ))}
            </div>
        )
    }

    if (!productos || productos.length === 0) return <div className="menu-page">No hay productos.</div>

    const groups = productos.reduce((acc, p) => {
        const gid = p.grupo_id ?? 'sin-categoria'
        if (!acc[gid]) acc[gid] = []
        acc[gid].push(p)
        return acc
    }, {})

    const setRef = (gid, el) => {
        groupRefs.current[gid] = el
    }

    const scrollByOne = (gid, dir = 1) => {
        const el = groupRefs.current[gid]
        if (!el) return
        const child = el.querySelector('.producto-card')
        const gap = parseInt(window.getComputedStyle(el).gap || 16)
        const width = child ? child.offsetWidth + gap : el.clientWidth
        el.scrollBy({ left: dir * width, behavior: 'smooth' })
    }

    const getCategoryName = (gid, items) => {
        const found = categorias.find(c => String(c.id) === String(gid) || c.id === gid)
        if (found && (found.nombre || found.name)) return found.nombre || found.name
        // fallback to product-provided name if exists
        const sample = items && items.length ? items[0] : null
        return sample?.categoria_nombre || sample?.grupo_nombre || `Categoría ${gid}`
    }

    return (
        <div className="menu-page">
            {Object.entries(groups).map(([gid, items]) => (
                <section key={gid} className="menu-group">
                    <h2 className="menu-group-title">{getCategoryName(gid, items)}</h2>

                    <div className="slider">
                        <button className="slider-btn prev" onClick={() => scrollByOne(gid, -1)} aria-label="Anterior">‹</button>

                        <div className="slider-track" ref={(el) => setRef(gid, el)}>
                            {items.map(producto => (
                                <ProductoCard producto={producto} key={producto.id} />
                            ))}
                        </div>

                        <button className="slider-btn next" onClick={() => scrollByOne(gid, 1)} aria-label="Siguiente">›</button>
                    </div>
                </section>
            ))}
        </div>
    )
}