
import MainLayout from "../../../../layouts/MainLayout.jsx";

import useProductosPorCategoria from "../../../../hooks/Productos/useProductoCategoriaIndex.js";

import ProductoGrid from "../../../../components/productos/ProductoGrid.jsx";

export default function ProductoCategoriaIndex () {
    const { productos, loading, error } = useProductosPorCategoria()
    return (
        <MainLayout>
            <section className="page-content">
                <ProductoGrid productos={productos} loading={loading} error={error} />
            </section>
        </MainLayout>
    )
}