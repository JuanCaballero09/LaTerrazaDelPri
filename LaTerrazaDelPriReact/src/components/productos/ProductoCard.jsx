import NoImg from '../../assets/images/ImagenNoDisponible4-3.png'
import './Producto.css'

export default function ProductoCard ({ producto, Proddisponible = true }) {
    const fixedPrecio = parseFloat(producto?.precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (!Proddisponible) {
        return null;
    }

    return (    
        <div className="producto-card">
            {producto.imagen_url === null ? (
                <img src={NoImg} alt="Imagen no disponible" loading="lazy" />
            ) : (
                <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    loading="lazy"
                />
            )
        }

        <h3>{producto.nombre}</h3>
        <p className="producto-price">${fixedPrecio}</p>
        </div>
    )
}
