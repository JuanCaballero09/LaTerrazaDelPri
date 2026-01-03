import './Combo.css'
import NoImg from '../../assets/images/ImagenNoDisponible4-3.png'
import { Link } from 'react-router-dom'
import { slugify } from '../../utils/slugify'
import ImageWithSkeleton from '../ui/Skeletons/ImageWithSkeleton'
import useCart from '../../hooks/useCart'
import { CirclePlus } from 'lucide-react'
import * as productoApi from '../../api/producto.api'

export default function ComboCard ({ combo, disponible = true }) {
    const { addItem, showToast } = useCart()
    const fixedPrecio = parseFloat(combo?.precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (!disponible) return null;

    // Usar el nombre del grupo (campo `grupo_nombre` o `combo.grupo.nombre`) para el slug de categoría.
    // Si no hay nombre de grupo, usar `combo.type` o un fallback genérico para evitar que el slug use el nombre del combo.
    const categoriaNombre = combo.grupo_nombre || (combo.grupo && combo.grupo.nombre) || combo.type || 'categoria'
    const categoriaPart = `${combo.grupo_id || ''}-${slugify(categoriaNombre)}`
    const productoPart = `${combo.id}-${slugify(combo.nombre || '')}`
    const to = `/categoria/${categoriaPart}/producto/${productoPart}`

    const disabled = combo?.disponible === false

    const handleAdd = async (e) => {
        e.preventDefault()

        if (disabled) {
            showToast('Producto no disponible')
            return
        }

        try {
            const res = await productoApi.getProducto(combo.grupo_id, combo.id)
            const serverProduct = res?.data
            if (!serverProduct) {
                showToast('No se pudo verificar el producto')
                return
            }

            if (serverProduct.disponible === false) {
                showToast('Producto no disponible')
                return
            }

            addItem({ id: combo.id, nombre: combo.nombre, precio: combo.precio, imagen_url: combo.imagen_url, ingredientes: combo.ingredientes || [], type: 'combo', grupo_id: combo.grupo_id })
        } catch (err) {
            showToast(err?.response?.data?.error || 'Error verificando disponibilidad')
        }
    }

    return (    
        <Link to={to} className="combo-card">
            <ImageWithSkeleton
                src={combo.imagen_url}
                alt={combo.nombre}
                fallbackSrc={NoImg}
            />

            <h3>{combo.nombre}</h3>
            <p className="combo-price">${fixedPrecio}</p>

            <div className="combo-card-actions">
                <button className="btn btn-add" onClick={handleAdd} disabled={disabled}>Agregar<CirclePlus /></button>
            </div>
        </Link>
    )
}
