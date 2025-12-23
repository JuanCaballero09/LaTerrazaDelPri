import "./CategoryPage.css"
import NoImg from '../../assets/images/ImagenNoDisponible4-3.png'

export default function CategoriaPage({categoria}){
    return (
        <div className="categoria-page">
            <div className="categoria-page-img-container">
                <img src={categoria.imagen_url || NoImg} alt={categoria.nombre} className="categoria-page-img"/>
            </div>
            <section className="categoria-page-content">
                <h2>{categoria.nombre}</h2>
                <p>{categoria.descripcion}</p>
            </section>
        </div>
    )
}