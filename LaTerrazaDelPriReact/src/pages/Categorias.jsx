import CategoryGrid from "../components/categorias/CategoryGrid";
import MainLayout from "../layouts/MainLayout";
import { useCategorias } from "../hooks/useCategorias";
import './Categorias.css'


export default function Categorias(){
    const { categorias, loading: categoriasLoading, error: categoriasError } = useCategorias()

    return (
        <MainLayout>
            <section className="categorias-page">
                <CategoryGrid categories={categorias} loading={categoriasLoading} error={categoriasError} />
            </section>
        </MainLayout>
    )
}