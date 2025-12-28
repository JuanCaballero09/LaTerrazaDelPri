
import PageSkeleton from '../ui/Skeletons/PageSkeleton'
import useCart from '../../hooks/useCart'
import { CirclePlus } from 'lucide-react'
import './Producto.css'
import defaultImg from '../../assets/images/ImagenNoDisponible4-3.png'

export default function ProductoPage ({ producto }){
	const { addItem, showToast } = useCart()

	if (!producto) return <PageSkeleton />

	const disabled = producto.disponible === false

	// Determinar si es combo y normalizar componentes/items que puedan venir como array u objeto indexado
	const isCombo = String(producto.type || '').toLowerCase() === 'combo'

	const components = (() => {
		if (producto.items) {
			return Array.isArray(producto.items) ? producto.items : Object.values(producto.items)
		}
		if (producto.components) {
			return Array.isArray(producto.components) ? producto.components : Object.values(producto.components)
		}
		return []
	})()

	const handleAdd = async (e) => {
		e?.preventDefault()

		try {
			const res = await import('../../api/producto.api').then(m => m.getProducto(producto.grupo_id, producto.id))
			const serverProduct = res?.data
			if (!serverProduct) {
				showToast('No se pudo verificar el producto')
				return
			}

			if (serverProduct.disponible === false) {
				showToast('Producto no disponible')
				return
			}

			addItem({ id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen_url: producto.imagen_url, ingredientes: producto.ingredientes || [], type: producto.type, grupo_id: producto.grupo_id })
		} catch (err) {
			showToast(err?.response?.data?.error || 'Error verificando disponibilidad')
		}
	}

	return (
		<section className="producto-show">
			<aside className="producto-left">
				<div className="producto-image-wrap">
					{producto.imagen_url ? (
						<img src={producto.imagen_url} alt={producto.nombre} loading="lazy" />
					) : (
						<img src={defaultImg} alt="Imagen no disponible" />
					)}
				</div>

				<div className="price-card">
					<span className="price-label">PRECIO</span>
					<strong className="price-value">{parseFloat(producto.precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</strong>
				</div>

				<div className="add-to-cart">
					<button className="btn" onClick={handleAdd} disabled={disabled}>{disabled ? 'NO DISPONIBLE' : <>AGREGAR AL CARRITO<CirclePlus /></>}</button>
				</div>
			</aside>

			<main className="producto-right">
				<div className="producto-header">
					<h1 className="producto-title">{producto.nombre}</h1>
					<span className="producto-badge">{producto.grupo || producto.type || 'Producto'}</span>
				</div>

				<div className="descripcion-card">
					<h3>Descripción</h3>
					<p className="producto-desc">{producto.descripcion}</p>
				</div>

				{!isCombo && (
					<div className="ingredientes-card">
						<h4>Ingredientes</h4>
						{producto.ingredientes && producto.ingredientes.length > 0 ? (
							<ul>
								{producto.ingredientes.map((ing, idx) => (
									<li key={idx}>{ing}</li>
								))}
							</ul>
						) : (
							<p>No hay ingredientes listados.</p>
						)}
					</div>
				)}

				{components.length > 0 ? (
					<div className="components-card">
						<h4>Componentes</h4>
						<ul className="components-list">
							{components.map((it) => (
								<li key={it.id} className="component-item">
									{it.imagen_url ? (
										<img src={it.imagen_url} alt={it.nombre} loading="lazy" />
									) : (
										<div className="component-image-placeholder">Sin imagen</div>
									)}
									<div className="component-info">
										<strong>{it.nombre}</strong>
										<span>Cantidad: {it.cantidad}</span>
										{it.disponible === false && <span className="component-unavailable">No disponible</span>}
									</div>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</main>
		</section>
	)
}