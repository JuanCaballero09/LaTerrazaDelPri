import { useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import './ProductSuggestionsModal.css';

export default function ProductSuggestionsModal({ isOpen, suggestions, onAddProduct, onContinue }) {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);
  
  if (!isOpen) return null;

  const bebidas = suggestions.filter(p => p.type === 'Bebida');
  const acompanantes = suggestions.filter(p => p.type === 'Acompanante');

    const formatPrice = (price) => {
        return parseFloat(price).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    return (
        <div className="product-suggestions-modal-overlay" onClick={(e) => e.target.className === 'product-suggestions-modal-overlay' && onContinue()}>
            <div className="product-suggestions-modal">
                <div className="product-suggestions-modal-header">
                    <h2>¿Deseas agregar algo más?</h2>
                    <button className="product-suggestions-modal-close" onClick={onContinue} type="button">
                        <X size={24} />
                    </button>
                </div>

                <div className="product-suggestions-modal-body">
                    <p className="suggestions-intro">
                        Notamos que tu pedido no incluye bebidas ni acompañantes. 
                        ¡Aquí te sugerimos algunos productos que podrían completar tu orden!
                    </p>

                    {bebidas.length > 0 && (
                        <div className="suggestions-section">
                            <h3>Bebidas</h3>
                            <div className="suggestions-grid">
                                {bebidas.map(product => (
                                    <div key={product.id} className="suggestion-card">
                                        {product.imagen_url && (
                                            <div className="suggestion-image">
                                                <img src={product.imagen_url} alt={product.nombre} />
                                            </div>
                                        )}
                                        <div className="suggestion-info">
                                            <h4>{product.nombre}</h4>
                                            <p className="suggestion-price">
                                                Desde ${formatPrice(product.precio_minimo || product.precio)} COP
                                            </p>
                                            <button 
                                                className="btn-add-suggestion"
                                                onClick={() => onAddProduct(product)}
                                                type="button"
                                            >
                                                <Plus size={18} />
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {acompanantes.length > 0 && (
                        <div className="suggestions-section">
                            <h3>Acompañantes</h3>
                            <div className="suggestions-grid">
                                {acompanantes.map(product => (
                                    <div key={product.id} className="suggestion-card">
                                        {product.imagen_url && (
                                            <div className="suggestion-image">
                                                <img src={product.imagen_url} alt={product.nombre} />
                                            </div>
                                        )}
                                        <div className="suggestion-info">
                                            <h4>{product.nombre}</h4>
                                            <p className="suggestion-price">
                                                Desde ${formatPrice(product.precio_minimo || product.precio)} COP
                                            </p>
                                            <button 
                                                className="btn-add-suggestion"
                                                onClick={() => onAddProduct(product)}
                                                type="button"
                                            >
                                                <Plus size={18} />
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="product-suggestions-modal-footer">
                    <button 
                        type="button"
                        onClick={onContinue} 
                        className="btn-continue-order"
                    >
                        No gracias, continuar con mi pedido
                    </button>
                </div>
            </div>
        </div>
    );
}
