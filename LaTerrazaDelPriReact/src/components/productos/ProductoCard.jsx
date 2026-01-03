import NoImg from '../../assets/images/ImagenNoDisponible4-3.png'
import './Producto.css'
import CardSkeleton from '../ui/Skeletons/CardSkeleton'
import ImageWithSkeleton from '../ui/Skeletons/ImageWithSkeleton'
import { Link } from 'react-router-dom'
import { slugify } from '../../utils/slugify'
import { CirclePlus } from 'lucide-react'
import useCart from '../../hooks/useCart'
import * as productoApi from '../../api/producto.api'

export default function ProductoCard ({ producto, Proddisponible = true, loading}) {
    const { addItem, showToast } = useCart()
    
    if (loading) return <CardSkeleton />
    if (!Proddisponible) return null

    const fixedPrecio = producto && producto.precio != null
        ? parseFloat(producto.precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : '0,00 COP'

    const categoriaPart = `${producto.grupo_id}-${slugify(producto.nombre || '')}`
    const productoPart = `${producto.id}-${slugify(producto.nombre || '')}`
    const to = `/categoria/${categoriaPart}/producto/${productoPart}`

    

    const disabled = producto?.disponible === false

    const handleAdd = async (e) => {
        e.preventDefault()

        try {
            // comprobar estado más reciente en el servidor
            const res = await productoApi.getProducto(producto.grupo_id, producto.id)
            const serverProduct = res?.data
            if (!serverProduct) {
                showToast('No se pudo verificar el producto')
                return
            }

            if (serverProduct.disponible === false) {
                showToast('Producto no disponible')
                return
            }

            addItem({ id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen_url: producto.imagen_url, ingredientes: producto.ingredientes || [], type: producto.type, grupo_id: producto.grupo_id })
        } catch (err) {
            showToast(err?.response?.data?.error || 'Error verificando disponibilidad')
        }
    }

    return (
        <Link to={to} className="producto-card">
            <ImageWithSkeleton
                src={producto.imagen_url}
                alt={producto.nombre}
                fallbackSrc={NoImg}
            />

            <h3>{producto.nombre}</h3>
            <p className="producto-price">${fixedPrecio}</p>


            <div className="producto-card-actions">
                <button className="btn btn-add" onClick={handleAdd} disabled={disabled}>Agregar<CirclePlus /></button>
            </div>
        </Link>
    )
}
