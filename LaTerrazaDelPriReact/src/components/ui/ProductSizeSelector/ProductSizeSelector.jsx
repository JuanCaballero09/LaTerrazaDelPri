import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import './ProductSizeSelector.css';

/**
 * Componente modal para seleccionar el tamaño de un producto
 * @param {Object} producto - Producto con tamaños disponibles
 * @param {Function} onSelect - Callback al seleccionar tamaño (tamano, precio)
 * @param {Function} onClose - Callback para cerrar el modal
 */
export function ProductSizeSelector({ producto, onSelect, onClose }) {
  const [selectedTamano, setSelectedTamano] = useState(null);
  
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  const handleSelect = () => {
    if (selectedTamano) {
      const precio = producto.precios_por_tamano?.[selectedTamano] || producto.precio;
      onSelect(selectedTamano, precio);
      onClose();
    }
  };

  // Si no tiene tamaños, seleccionar directamente
  if (!producto.tamanos_disponibles || producto.tamanos_disponibles.length === 0) {
    onSelect(null, producto.precio);
    onClose();
    return null;
  }

  return (
    <div className="size-selector-overlay" onClick={onClose}>
      <div className="size-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="size-selector-header">
          <h3>Selecciona el tamaño</h3>
          <button className="size-selector-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="size-selector-product-info">
          {producto.imagen_url && (
            <img src={producto.imagen_url} alt={producto.nombre} />
          )}
          <div>
            <h4>{producto.nombre}</h4>
            <p>{producto.descripcion}</p>
          </div>
        </div>

        <div className="size-selector-options">
          {producto.tamanos_disponibles.map((tamano) => {
            const precio = producto.precios_por_tamano?.[tamano] || producto.precio;
            const isSelected = selectedTamano === tamano;

            return (
              <div
                key={tamano}
                className={`size-option ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedTamano(tamano)}
              >
                <div className="size-option-info">
                  <span className="size-option-name">{tamano}</span>
                  <span className="size-option-price">
                    ${parseFloat(precio).toLocaleString('es-CO')}
                  </span>
                </div>
                {isSelected && (
                  <div className="size-option-check">
                    <Check size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="size-selector-actions">
          <button
            className="size-selector-btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="size-selector-btn-confirm"
            onClick={handleSelect}
            disabled={!selectedTamano}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
