import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import MainLayout from '../../../../layouts/MainLayout'
import LoadingDots from '../../../../components/ui/LoadingDots.jsx'
import useProductoShow from '../../../../hooks/Productos/useProductoShow'
import '../../../../components/productos/Producto.css'

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
				<section className="producto-show">
					<div className="producto-show-image">
						{producto.imagen_url ? (
							<img src={producto.imagen_url} alt={producto.nombre} loading="lazy" />
						) : (
							<div className="producto-image-placeholder">Sin imagen</div>
						)}
					</div>

					<div className="producto-show-content">
						<h1>{producto.nombre}</h1>
						<p className="producto-price">{parseFloat(producto.precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
						<p className="producto-desc">{producto.descripcion}</p>

						<div className="producto-meta">
							<p>Disponibilidad: {producto.disponible ? 'Disponible' : 'No disponible'}</p>
							<p>Ventas: {producto.sales_count ?? 0}</p>
							<p>Tipo: {producto.type || 'normal'}</p>
						</div>

						{producto.ingredientes && producto.ingredientes.length > 0 && (
							<div className="producto-ingredientes">
								<h3>Ingredientes</h3>
								<ul>
									{producto.ingredientes.map((ing, idx) => (
										<li key={idx}>{ing}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</section>
			</section>
		</MainLayout>
	)
}
