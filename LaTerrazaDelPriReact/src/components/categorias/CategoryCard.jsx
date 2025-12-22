import './CategoryCard.css'
import NoImg from '../../assets/images/ImagenNoDisponible4-3.png'

export default function CategoryCard ({ category }) {
    return (
        
        <div className="category-card">
            {category.imagen_url === null ? (
                <img src={NoImg} alt="Imagen no disponible" loading="lazy" />
            ) : (
                <img
                    src={category.imagen_url}
                    alt={category.nombre}
                    loading="lazy"
                />
            )
        }

        <h3>{category.nombre}</h3>
        <p>{category.descripcion}</p>
        </div>
    )
}
