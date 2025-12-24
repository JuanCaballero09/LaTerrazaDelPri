import './Combo.css'
import NoImg from '../../assets/images/ImagenNoDisponible4-3.png'
import { Link } from 'react-router-dom'
import { slugify } from '../../utils/slugify'
import useCart from '../../hooks/useCart'
import { CirclePlus } from 'lucide-react'

export default function ComboCard ({ combo, disponible = true }) {
    const { addItem } = useCart()
    const fixedPrecio = parseFloat(combo?.precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (!disponible) return null;

    const categoriaPart = `${combo.grupo_id || ''}-${slugify(combo.nombre || '')}`
    const productoPart = `${combo.id}-${slugify(combo.nombre || '')}`
    const to = `/categoria/${categoriaPart}/producto/${productoPart}`

    const handleAdd = (e) => {
        e.preventDefault()
        addItem({ id: combo.id, nombre: combo.nombre, precio: combo.precio, imagen_url: combo.imagen_url, ingredientes: combo.ingredientes || [], type: 'combo', grupo_id: combo.grupo_id })
    }

    return (    
        <Link to={to} className="combo-card">
            {combo.imagen_url === null ? (
                <img src={NoImg} alt="Imagen no disponible" loading="lazy" />
            ) : (
                <img
                    src={combo.imagen_url}
                    alt={combo.nombre}
                    loading="lazy"
                />
            )}

            <h3>{combo.nombre}</h3>
            <p className="combo-price">${fixedPrecio}</p>

            <div className="combo-card-actions">
                <button className="btn btn-add" onClick={handleAdd}>Agregar<CirclePlus /></button>
            </div>
        </Link>
    )
}
