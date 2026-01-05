import { useState, useEffect } from 'react'
import PageSkeleton from '../ui/Skeletons/PageSkeleton'
import useCart from '../../hooks/useCart'
import { CirclePlus } from 'lucide-react'
import './Producto.css'
import defaultImg from '../../assets/images/ImagenNoDisponible4-3.png'

export default function ProductoPage ({ producto }){
const { addItem, showToast } = useCart()
const [selectedTamano, setSelectedTamano] = useState(null)

	// Determinar si necesita selección de tamaño
	const tiposConTamano = ['Pizza', 'Bebida', 'Acompañante']
	const necesitaTamano = producto && tiposConTamano.includes(producto.type) && 
						   producto.tamanos_disponibles && 
						   producto.tamanos_disponibles.length > 0

	// Inicializar tamaño por defecto al cargar
	useEffect(() => {
		if (necesitaTamano && !selectedTamano && producto.tamanos_disponibles.length > 0) {
			setSelectedTamano(producto.tamanos_disponibles[0])
		}
	}, [necesitaTamano, selectedTamano, producto])

	if (!producto) return <PageSkeleton />

	const disabled = producto.disponible === false

	// Determinar si es combo y normalizar componentes/items que puedan venir como array u objeto indexado
	const isCombo = String(producto.type || '').toLowerCase() === 'combo'
	const isBebida = String(producto.type || '').toLowerCase() === 'bebida'

	const components = (() => {
		// El backend envía 'items' para combos
		if (producto.items && Array.isArray(producto.items)) {
			return producto.items
		}
		// Fallback por si viene como objeto
		if (producto.items && typeof producto.items === 'object') {
			return Object.values(producto.items)
		}
		return []
	})()

	// Obtener precio según tamaño seleccionado
	const getPrecioActual = () => {
		if (necesitaTamano && selectedTamano && producto.precios_por_tamano) {
			const precio = producto.precios_por_tamano[selectedTamano]
			return parseFloat(precio) || parseFloat(producto.precio)
		}
		return parseFloat(producto.precio)
	}

	const handleAdd = async (e) => {
e?.preventDefault()

// Validar que se haya seleccionado un tamaño si es necesario
if (necesitaTamano && !selectedTamano) {
showToast('Por favor selecciona un tamaño')
return
}

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

const precioFinal = getPrecioActual()
const nombreFinal = necesitaTamano && selectedTamano 
? `${producto.nombre} - ${selectedTamano}`
: producto.nombre

addItem({ 
id: producto.id, 
nombre: nombreFinal, 
precio: precioFinal, 
imagen_url: producto.imagen_url, 
ingredientes: producto.ingredientes || [], 
type: producto.type, 
grupo_id: producto.grupo_id,
tamano_selected: selectedTamano
})
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

		{/* Selector de tamaños */}
		{necesitaTamano && (
		<div className="tamanos-selector-card">
			<h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Selecciona tu tamaño</h4>
			<div className="tamanos-options">
				{producto.tamanos_disponibles.map(tamano => {
					const precio = producto.precios_por_tamano?.[tamano]
					const precioFormateado = precio 
					? parseFloat(precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
					: 'N/A'

				return (
				<button
					key={tamano}
					className={`tamano-option ${selectedTamano === tamano ? 'selected' : ''}`}
					onClick={() => setSelectedTamano(tamano)}
					>
					<span className="tamano-name">{tamano}</span>
					<strong className="tamano-price">${precioFormateado}</strong>
				</button>
				)
				})}
			</div>
		</div>
		)}

		<div className="price-card">
			<span className="price-label">PRECIO {necesitaTamano && selectedTamano ? `(${selectedTamano})` : ''}</span>
			<strong className="price-value">${getPrecioActual().toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</strong>
		</div>

		<div className="add-to-cart">
			<button className="btn" onClick={handleAdd} disabled={disabled}>
				{disabled ? 'NO DISPONIBLE' : <>AGREGAR AL CARRITO<CirclePlus /></>}
			</button>
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

		{!isCombo && !isBebida && (
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

		{isCombo && components.length === 0 && (
			<div className="components-card">
				<h4>Componentes</h4>
				<p style={{ color: '#888', fontStyle: 'italic', padding: '1rem' }}>
					Este combo aún no tiene productos configurados.
				</p>
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
					<img src={defaultImg} alt="Imagen no disponible" />
				)}
				<div className="component-info">
					<strong>{it.nombre}</strong>
					<div className="component-details">
						<span>Cantidad: {it.cantidad}</span>
						{it.tamano && <span className="component-size">Tamaño: {it.tamano}</span>}
					</div>
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
