
import { Link, useParams} from 'react-router-dom'
import ProductoCard from './ProductoCard'


import CardSkeleton from '../ui/Skeletons/CardSkeleton'
import { Ban } from 'lucide-react';
import './Producto.css'

export default function ProductoGrid ({ productos, loading, error, length = null }) {
    const { id } = useParams();

    if (error) {
        return (
        <p className="producto-error hidden">
            Error al cargar los productos
        </p>
        )
    }

    if (productos.length === 0) {
        return (
            <div className="producto-no-data">
                <Ban size={55}/>
                <p>No hay productos en esta categoría.</p>
            </div>
        )
    }

    const getProductosDisponibles = () => {
        return productos.filter(producto => producto.disponible);
    }

    if (getProductosDisponibles().length === 0) {
        return (
            <div className="producto-no-data">
                <Ban size={55}/>
                <p>No hay productos disponibles en esta categoría.</p>
            </div>
        )
    }

    const visibleProductos = length
        ? productos.slice(0, length)
        : productos

    return (
        <>
            <h1 className='producto-title'>Productos</h1>
            <section className="producto-grid">
            {loading
                ? Array.from({ length: length || 4 }).map((_, index) => (
                    <CardSkeleton key={index} />
                    ))
                : visibleProductos.map(producto => (
                    <ProductoCard
                        key={producto.id}
                        producto={producto}
                        loading={false}
                        Proddisponible={producto.disponible}
                    />
                    
                    ))
            }
            </section>
            {length && productos.length > length && !loading && (
                <Link to={`/categoria/${ id }`} className='producto-more'>Ver más productos</Link>
            )}
        </>
    )
}
