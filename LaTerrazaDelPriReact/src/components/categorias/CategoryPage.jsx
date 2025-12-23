import { Link, Links } from 'react-router-dom'

import useProductosPorCategoria from '../../hooks/Productos/useProductoCategoriaIndex';

import NoImg from '../../assets/images/ImagenNoDisponible4-3.png'
import "./Category.css"

export default function CategoriaPage({categoria}){
    const { productos } = useProductosPorCategoria(categoria.id);

    return (
        <div className="categoria-page">
            <div className="categoria-page-img-container">
                <img src={categoria.imagen_url || NoImg} alt={categoria.nombre} className="categoria-page-img"/>
            </div>
            <section className="categoria-page-content">
                <h2>{categoria.nombre}</h2>
                <p>{categoria.descripcion}</p>
                <hr />
                <h2>Cantidad de Platillos</h2>
                <h3>{productos.length}</h3>
            </section>
            <div className='categoria-page-links'>
                {productos.length === 0 ? null : (
                    <Link to={`/categoria/${categoria.id}/productos`} className='categoria-page-link'>Ver productos</Link>
                )}
                <Link to={`/`} className='categoria-page-link return'>Volver al inicio</Link>
            </div>
        </div>
    )
}