

import MainLayout from '../../layouts/MainLayout'
import Header from '../../components/ui/Header/Header'
import LoadingDots from '../../components/ui/LoadingDots'

import { useBanners } from '../../hooks/useBanners'
import { useCombos } from '../../hooks/useCombos'
import { useCategoriaIndex } from '../../hooks/Categorias/useCategoriaIndex'

import ComboGrid from '../../components/combos/ComboGrid'
import CategoryGrid from '../../components/categorias/CategoryGrid'


import './Home.css'

export default function Home () {
    
    const { banners, loading: bannersLoading, error: bannersError } = useBanners()
    const { combos, loading: combosLoading, error: combosError } = useCombos()
    const { categorias, loading: categoriasLoading, error: categoriasError } = useCategoriaIndex()
    
    return (
        <MainLayout>
            
            <Header banners={banners} loading={bannersLoading} error={bannersError} />
            <section className='home-content'>
                <ComboGrid combos={combos} loading={combosLoading} error={combosError} length={4} />
                <CategoryGrid categories={categorias} loading={categoriasLoading} error={categoriasError} length={4} />
                {(combosError || categoriasError) && <p className='home-error'><LoadingDots text='Error al cargar los datos intentando reconectar' color='#c0392b'/></p>}
            </section>

        </MainLayout>
    )
}
