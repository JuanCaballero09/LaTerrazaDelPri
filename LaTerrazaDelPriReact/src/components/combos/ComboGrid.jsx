import { Link } from 'react-router-dom'
import CardSkeleton from '../ui/Skeletons/CardSkeleton'
import ComboCard from './ComboCard'

import './Combo.css'

export default function ComboGrid ({ combos, loading, error, length = null }) {
    if (error) {
        return (
        <p className="combo-error hidden">
            Error al cargar los combos
        </p>
        )
    }

    const visibleCombos = length
        ? combos.slice(0, length)
        : combos

    return (
        <>
            {combos.length === 0 && !loading && (
                <span></span>
            )}
            {combos.length > 0 && (
                <>
                <h1 className='combo-title'>Combos</h1>
                <section className="combo-grid">
                {loading
                    ? Array.from({ length: length || 4 }).map((_, index) => (
                        <CardSkeleton key={index} />
                        ))
                    : visibleCombos.map(combo => (
                        <ComboCard
                            key={combo.id}
                            combo={combo}
                            loading={false}
                        />
                        
                        ))
                }
                </section>
                {length && combos.length > length && !loading && (
                    <Link to="/combos" className='combo-more'>Ver más combos</Link>
                )}
                </>
            )}
        </>
    )
}
