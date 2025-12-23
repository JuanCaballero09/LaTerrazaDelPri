import { useEffect } from "react";
import { useParams } from "react-router-dom";

import useCategoriaShow from "../../../hooks/Categorias/useCategoriaShow.js"

import MainLayout from "../../../layouts/MainLayout.jsx";
import CategoriaPage from "../../../components/categorias/CategoryPage.jsx";

import LoadingDots from "../../../components/ui/LoadingDots.jsx";
import "./Categoria.css"

export default function CategoriaShow(){
    const { id } = useParams();
    const { categoria, loading, error, fetchCategoria } = useCategoriaShow()

    useEffect(() => {
        fetchCategoria(id);
    }, [id]);

    if (loading) return (
        <MainLayout>
            <div className="categoriaShow-loading">
                <LoadingDots text="Cargando categoría" color="var(--text-color)"/>
            </div>
        </MainLayout>
    );
    if (error) return (
        <MainLayout>
            <p className="categoriaShow-error">Error cargando la categoría</p>
        </MainLayout>
    );
    if (!categoria) return null
    
    return (
        <MainLayout>
            <CategoriaPage categoria={categoria} loading={loading} error={error} />
        </MainLayout>
    )
}