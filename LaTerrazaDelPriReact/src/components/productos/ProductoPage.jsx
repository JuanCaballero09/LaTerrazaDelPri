
export default function ProductoPage ({producto}){
    return (
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
    )
}