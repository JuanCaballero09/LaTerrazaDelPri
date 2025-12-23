import { useParams } from "react-router-dom";

import useCategoriaShow from "../../../hooks/Categorias/useCategoriaShow"

import MainLayout from "../../../layouts/MainLayout";
import CategoriaPage from "../../../components/categorias/CategoryPage";

import PageSkeleton from "../../../components/ui/Skeletons/PageSkeleton";
import LoadingDots from "../../../components/ui/LoadingDots";
import "./Categoria.css"
import { useEffect } from "react";

export default function CategoriaShow() {
    const { id } = useParams();
    const { categoria, loading, error, fetchCategoria } = useCategoriaShow(id);
    
    useEffect(() => {
        fetchCategoria();
    }, [id]);

    useEffect(() => {
        if (!error) return;

        const retryInterval = setInterval(fetchCategoria, 3000);

        return () => {
            clearInterval(retryInterval);
        };
    }, [error, fetchCategoria]);

    return (
        <MainLayout>
            <section className="page-content">

                {loading && <PageSkeleton />}

                {error && (
                    <section className="page-error">
                        <p>Error al cargar la categoría. Por favor, inténtalo de nuevo más tarde.</p>
                        <hr />
                        <LoadingDots text='Intentando reconectar' color='var(--primary-color)'/>
                    </section>
                )}

                {!loading && !error && categoria && (
                    <CategoriaPage categoria={categoria}     />
                )}
            </section>
        </MainLayout>
    );
}