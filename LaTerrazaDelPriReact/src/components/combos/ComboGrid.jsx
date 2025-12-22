import CardSkeleton from '../ui/Skeletons/CardSkeleton'
import ComboCard from './ComboCard'

import './ComboGrid.css'

export default function ComboGrid ({ combos, loading, error }) {
    if (error) {
        return (
        <p className="combo-error hidden">
            Error al cargar los combos
        </p>
        )
    }

    if (loading && combos.length === 0) {
        return <CardSkeleton cards={3} />
    }

    return (
        <>
            <h1 className='combo-title'>Combos</h1>
            <section className="combo-grid">
            {(loading ? Array.from({ length: 3 }) : combos).map((combo, index) => (
                <ComboCard
                key={combo?.id || index}
                combo={combo}
                loading={loading}
                />
            ))}
            </section>
        </>
    )
}
