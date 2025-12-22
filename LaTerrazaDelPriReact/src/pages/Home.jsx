
import MainLayout from '../layouts/MainLayout'
import Header from '../components/ui/Header/Header'
import { useBanners } from '../hooks/useBanners'
import { useCombos } from '../hooks/useCombos'
import { useCategorias } from '../hooks/useCategorias'
import ComboGrid from '../components/combos/ComboGrid'
import CategoryGrid from '../components/categorias/CategoryGrid'
import './Home.css'
import LoadingDots from '../components/ui/LoadingDots'

export default function Home () {
    // const apiStatus = useHealth()
    const { banners, loading: bannersLoading, error: bannersError } = useBanners()
    const { combos, loading: combosLoading, error: combosError } = useCombos()
    const { categorias, loading: categoriasLoading, error: categoriasError } = useCategorias()
    
    return (
        <MainLayout>
            
            <Header banners={banners} loading={bannersLoading} error={bannersError} />
            <section className='home-content'>
                <ComboGrid combos={combos} loading={combosLoading} error={combosError} />
                <CategoryGrid categories={categorias} loading={categoriasLoading} error={categoriasError} />
                {(combosError || categoriasError) && <p className='home-error'><LoadingDots text='Error al cargar los datos intentando reconectar' color='#c0392b'/></p>}
            </section>

        </MainLayout>
    )
}
