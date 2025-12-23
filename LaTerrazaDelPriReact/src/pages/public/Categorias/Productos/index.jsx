
import MainLayout from "../../../../layouts/MainLayout.jsx";

import useProductosPorCategoria from "../../../../hooks/Productos/useProductoCategoriaIndex.js";

import LoadingDots from "../../../../components/ui/LoadingDots.jsx";
import ProductoGrid from "../../../../components/productos/ProductoGrid.jsx";

export default function ProductoCategoriaIndex () {
    const { productos, loading, error } = useProductosPorCategoria()
    return (
        <MainLayout>
            <section className="page-content">
                {error && 
                    <div className="page-error">
                        <p>Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>
                        <hr />
                        <LoadingDots text='Intentando reconectar' color='var(--primary-color)'/>
                    </div>
                }
                <ProductoGrid productos={productos} loading={loading} error={error} />
            </section>
        </MainLayout>
    )
}