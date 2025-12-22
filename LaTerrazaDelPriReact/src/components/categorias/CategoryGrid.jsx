import CardSkeleton from '../ui/Skeletons/CardSkeleton'
import CategoryCard from './CategoryCard'
import './CategoryGrid.css'

export default function CategoryGrid ({ categories, loading, error }) {
    if (error) {
        return (
        <p className="category-error hidden">
            Error al cargar las categorías
        </p>
        )
    }

    if (loading && categories.length === 0) {
        return <CardSkeleton cards={3} />
    }

    return (
        <>
            <h1 className='category-title'>Categorías</h1>
            <section className="category-grid">
            {(loading ? Array.from({ length: 3 }) : categories).map((category, index) => (
                <CategoryCard
                key={category?.id || index}
                category={category}
                loading={loading}
                />
            ))}
            </section>
        </>
    )
}
