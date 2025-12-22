import './ComboCard.css'
import NoImg from '../../assets/images/ImagenNoDisponible4-3.png'

export default function ComboCard ({ combo }) {
    const fixedPrecio = parseFloat(combo?.precio).toFixed(2).replace('.', ',').concat(' COP').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return (    
        <div className="combo-card">
            {combo.imagen_url === null ? (
                <img src={NoImg} alt="Imagen no disponible" loading="lazy" />
            ) : (
                <img
                    src={combo.imagen_url}
                    alt={combo.nombre}
                    loading="lazy"
                />
            )
        }

        <h3>{combo.nombre}</h3>
        <p className="combo-price">${fixedPrecio}</p>
        </div>
    )
}
