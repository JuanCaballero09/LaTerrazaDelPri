

import MainLayout from '../../layouts/MainLayout'
import Header from '../../components/ui/Header/Header'
import LoadingDots from '../../components/ui/LoadingDots'

import { useBanners } from '../../hooks/useBanners'
import { useCombos } from '../../hooks/useCombos'
import { useCategoriaIndex } from '../../hooks/Categorias/useCategoriaIndex'

import ComboGrid from '../../components/combos/ComboGrid'
import CategoryGrid from '../../components/categorias/CategoryGrid'


export default function Home () {
    
    const { banners, loading: bannersLoading, error: bannersError } = useBanners()
    const { combos, loading: combosLoading, error: combosError } = useCombos()
    const { categorias, loading: categoriasLoading, error: categoriasError } = useCategoriaIndex()
    
    return (
        <MainLayout>
            
            <Header banners={banners} loading={bannersLoading} error={bannersError} />
            <section className='page-content'>
                <ComboGrid combos={combos} loading={combosLoading} error={combosError} length={4} />
                <CategoryGrid categories={categorias} loading={categoriasLoading} error={categoriasError} length={4} description={false} />
                {(combosError || categoriasError) && 
                    <div className='page-error'>
                        <p>Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.</p>
                        <hr />
                        <LoadingDots text='Intentando reconectar' color='var(--primary-color)'/>
                    </div>}
            </section>

        </MainLayout>
    )
}
