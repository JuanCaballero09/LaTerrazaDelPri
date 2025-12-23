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
                {(categoriasError) && 
                <div className='page-error'>
                    <p>Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.</p>
                    <hr />
                    <LoadingDots text='Intentando reconectar' color='var(--primary-color)'/>
                </div>}
            </section>
        </MainLayout>
    )
}
