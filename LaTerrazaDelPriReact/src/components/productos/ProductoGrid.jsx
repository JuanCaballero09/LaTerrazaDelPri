
import { Link, useParams} from 'react-router-dom'
import ProductoCard from './ProductoCard'


import CardSkeleton from '../ui/Skeletons/CardSkeleton'
import { Ban } from 'lucide-react';
import './Producto.css'

export default function ProductoGrid ({ productos, loading, error, length = null }) {
    const { id } = useParams();

    const getProductosDisponibles = () => {
        return productos.filter(producto => producto.disponible);
    }
    
    if (error) {
        return (
        <p className="producto-error hidden">
            Error al cargar los productos
        </p>
        )
    }

    if (loading) {
        return (
            <>
                <h1 className='producto-title'>Productos</h1>
                <section className="producto-grid">

                    {Array.from({ length: length || 4 }).map((_, index) => (
                        <CardSkeleton key={index} />
                    ))}
                </section>
            </>
        );
    }

    // Solo mostrar "no hay productos" si loading es false y productos.length === 0
    if (!loading && productos.length === 0) {
        return (
            <div className="producto-no-data">
                <Ban size={55}/>
                <p>No hay productos en esta categoría.</p>
            </div>
        );
    }

    // Solo mostrar "no hay productos disponibles" si loading es false, hay productos, pero ninguno disponible
    if (!loading && productos.length > 0 && getProductosDisponibles().length === 0) {
        return (
            <div className="producto-no-data">
                <Ban size={55}/>
                <p>No hay productos disponibles en esta categoría.</p>
            </div>
        );
    }

    // Solo mostrar productos disponibles
    const productosDisponibles = getProductosDisponibles();
    const visibleProductos = length
        ? productosDisponibles.slice(0, length)
        : productosDisponibles;

    return (
        <>
            <h1 className='producto-title'>Productos</h1>
            <section className="producto-grid">
                {visibleProductos.map(producto => (
                    <ProductoCard
                        key={producto.id}
                        producto={producto}
                        loading={false}
                        Proddisponible={producto.disponible}
                    />
                ))}
            </section>
            {length && productosDisponibles.length > length && (
                <Link to={`/categoria/${ id }`} className='producto-more'>Ver más productos</Link>
            )}
        </>
    );
}
