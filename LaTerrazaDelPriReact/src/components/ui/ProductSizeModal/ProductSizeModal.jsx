import { useState } from 'react';
import { X } from 'lucide-react';
import './ProductSizeModal.css';

export default function ProductSizeModal({ isOpen, onClose, product, onAddToCart }) {
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !product) return null;

    const hasMultipleSizes = product.tamanos_disponibles && product.tamanos_disponibles.length > 0;
    const prices = product.precios_por_tamano || {};

    const handleAdd = () => {
        if (hasMultipleSizes && !selectedSize) {
            alert('Por favor selecciona un tamaño');
            return;
        }

        const selectedPrice = hasMultipleSizes && selectedSize 
            ? prices[selectedSize] || product.precio 
            : product.precio;

        onAddToCart({
            ...product,
            quantity,
            selectedSize: hasMultipleSizes ? selectedSize : null,
            precio: selectedPrice
        });

        // Reset y cerrar
        setSelectedSize('');
        setQuantity(1);
        onClose();
    };

    const getSizeLabel = () => {
        if (product.type === 'Pizza') return 'Tamaño';
        if (product.type === 'Bebida') return 'Tamaño';
        if (product.type === 'Acompanante') return 'Porción';
        return 'Tamaño';
    };

    const currentPrice = hasMultipleSizes && selectedSize 
        ? prices[selectedSize] || product.precio 
        : product.precio;

    return (
        <div className="product-size-modal-overlay" onClick={(e) => e.target.className === 'product-size-modal-overlay' && onClose()}>
            <div className="product-size-modal">
                <div className="product-size-modal-header">
                    <h2>Selecciona {getSizeLabel()}</h2>
                    <button className="product-size-modal-close" onClick={onClose} type="button">
                        <X size={24} />
                    </button>
                </div>

                <div className="product-size-modal-body">
                    {product.imagen_url && (
                        <div className="product-size-image">
                            <img src={product.imagen_url} alt={product.nombre} />
                        </div>
                    )}

                    <h3 className="product-size-name">{product.nombre}</h3>
                    
                    {product.descripcion && (
                        <p className="product-size-description">{product.descripcion}</p>
                    )}

                    {hasMultipleSizes && (
                        <div className="product-size-options">
                            <label className="product-size-label">Selecciona {getSizeLabel()}:</label>
                            <div className="product-size-grid">
                                {product.tamanos_disponibles.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        className={`product-size-option ${selectedSize === size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        <span className="size-name">{size}</span>
                                        <span className="size-price">
                                            ${parseFloat(prices[size] || product.precio).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="product-size-quantity">
                        <label className="product-size-label">Cantidad:</label>
                        <div className="quantity-controls">
                            <button 
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="quantity-btn"
                            >
                                -
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button 
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                                className="quantity-btn"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="product-size-total">
                        <span>Total:</span>
                        <span className="total-price">
                            ${(parseFloat(currentPrice) * quantity).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} COP
                        </span>
                    </div>
                </div>

                <div className="product-size-modal-footer">
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="btn-cancel-size"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button"
                        onClick={handleAdd} 
                        className="btn-add-size"
                        disabled={hasMultipleSizes && !selectedSize}
                    >
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    );
}
