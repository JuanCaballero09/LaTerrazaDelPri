import { Link } from 'react-router-dom'

import CategoryCard from './CategoryCard'
import CardSkeleton from '../ui/Skeletons/CardSkeleton'
import './Category.css'

export default function CategoryGrid ({ categories, loading, error, length = null, description = true }) {


    if (error) {
        return (
            <p className="category-error hidden">
                Error al cargar las categorías
            </p>
        );
    }

    if (loading) {
        return (
            <>
                <h1 className='category-title'>Categorías</h1>
                <section className="category-grid">
                    {Array.from({ length: length || 8 }).map((_, index) => (
                        <CardSkeleton key={index} btn={false} />
                    ))}
                </section>
            </>
        );
    }

    if (!loading && categories.length === 0) {
        return (
            <div className="category-no-data">
                <p>No hay categorías disponibles.</p>
            </div>
        );
    }

    if (!loading && categories.every(category => category.Prodcantidad === 0)) {
        return (
            <div className="category-no-data">
                <p>No hay categorías con productos disponibles.</p>
            </div>
        );
    }

    const visibleCategories = length
        ? categories.slice(0, length)
        : categories


    return (
        <>
            <h1 className='category-title'>Categorías</h1>
            <section className="category-grid">
                {visibleCategories.map(category => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        loading={false}
                        description={description}
                    />
                ))}
            </section>
            {length && categories.length > length && (
                <Link to="/categorias" className='category-more'>Ver más categorías</Link>
            )}
        </>
    );
}
