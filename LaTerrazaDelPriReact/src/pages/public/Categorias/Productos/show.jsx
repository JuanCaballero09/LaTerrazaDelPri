import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import MainLayout from '../../../../layouts/MainLayout'
import LoadingDots from '../../../../components/ui/LoadingDots.jsx'
import useProductoShow from '../../../../hooks/Productos/useProductoShow'
import '../../../../components/productos/Producto.css'
import ProductoPage from '../../../../components/productos/ProductoPage.jsx'

export default function ProductoShow() {
	const { categoriaSlug, productoSlug } = useParams()

	const categoriaId = useMemo(() => categoriaSlug?.split('-')?.[0], [categoriaSlug])
	const productoId = useMemo(() => productoSlug?.split('-')?.[0], [productoSlug])

	const { producto, loading, error } = useProductoShow(categoriaId, productoId)

	if (loading) {
		return (
			<MainLayout>
				<section className="page-content">
					<div className="page-error">
						<LoadingDots text="Cargando producto" color="var(--text-color)" />
					</div>
				</section>
			</MainLayout>
		)
	}

	if (error) {
		return (
			<MainLayout>
				<section className="page-content">
					<div className="page-error">
						<p>Error cargando el producto. Reintentando...</p>
						<hr />
						<LoadingDots text="Reconectando" color="var(--primary-color)" />
					</div>
				</section>
			</MainLayout>
		)
	}

	if (!producto) return null

	return (
		<MainLayout>
			<section className="page-content">
				<ProductoPage producto={producto} />
			</section>
		</MainLayout>
	)
}
