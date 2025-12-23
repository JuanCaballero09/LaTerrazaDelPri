import { Link } from 'react-router-dom'
import CardSkeleton from '../ui/Skeletons/CardSkeleton'
import CategoryCard from './CategoryCard'
import './CategoryGrid.css'

export default function CategoryGrid ({ categories, loading, error, length = null }) {
    if (error) {
        return (
        <p className="category-error hidden">
            Error al cargar las categorías
        </p>
        )
    }

    const visibleCategories = length
        ? categories.slice(0, length)
        : categories


    return (
        <>
            <h1 className='category-title'>Categorías</h1>
            <section className="category-grid">
            {loading
                ? Array.from({ length: length || 4 }).map((_, index) => (
                    <CardSkeleton key={index} />
                    ))
                : visibleCategories.map(category => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        loading={false}
                    />
                    ))
            }
            </section>
            {length && categories.length > length && !loading && (
                <Link to="/categorias" className='category-more'>Ver más categorías</Link>
            )}
        </>
    )
}
