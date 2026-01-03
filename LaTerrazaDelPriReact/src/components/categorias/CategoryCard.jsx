import { Link } from 'react-router-dom'
import { slugify } from '../../utils/slugify.js'
import ImageWithSkeleton from '../ui/Skeletons/ImageWithSkeleton.jsx'
import './Category.css'
import NoImg from '../../assets/images/ImagenNoDisponible4-3.png'

export default function CategoryCard ({ category, description = true }) {
    const fixedDescripcion = category.descripcion.length > 60
        ? category.descripcion.slice(0, 57) + '...'
        : category.descripcion;

    return (
        
        <Link to={`/categoria/${category.id}-${slugify(category.nombre)}/productos`} className="category-card">
            <ImageWithSkeleton
                src={category.imagen_url}
                alt={category.nombre}
                fallbackSrc={NoImg}
            />

            <h3>{category.nombre}</h3>
            
            {description && <p>{fixedDescripcion}</p>}
        </Link>
    )
}
