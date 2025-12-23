import { useCategoriaIndex } from "../../../hooks/Categorias/useCategoriaIndex.js";

import CategoryGrid from "../../../components/categorias/CategoryGrid.jsx";
import MainLayout from "../../../layouts/MainLayout.jsx";

import LoadingDots from "../../../components/ui/LoadingDots.jsx";
import './Categoria.css'


export default function CategoriaIndex(){
    const { categorias, loading: categoriasLoading, error: categoriasError } = useCategoriaIndex()

    return (
        <MainLayout>
            <section className="page-content">
                <CategoryGrid categories={categorias} loading={categoriasLoading} error={categoriasError} />
                {(categoriasError) && <p className='categoriaIndex-error'><LoadingDots text='Error al cargar los datos intentando reconectar' color='#c0392b'/></p>}
            </section>
        </MainLayout>
    )
}
