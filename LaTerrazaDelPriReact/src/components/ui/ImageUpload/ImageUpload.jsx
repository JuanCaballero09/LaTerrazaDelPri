import { Upload, X } from 'lucide-react';
import './ImageUpload.css';

/**
 * Componente reutilizable para subir imágenes con drag & drop
 * @param {Object} props
 * @param {File|null} props.imageFile - Archivo de imagen seleccionado
 * @param {string|null} props.imagePreview - URL de preview de la imagen
 * @param {Function} props.onImageChange - Callback cuando cambia la imagen
 * @param {Function} props.onImageRemove - Callback para remover la imagen
 * @param {boolean} props.disabled - Deshabilitar el componente
 * @param {string} props.label - Etiqueta del campo
 * @param {boolean} props.required - Campo requerido
 */
export function ImageUpload({ 
  imageFile, 
  imagePreview, 
  onImageChange, 
  onImageRemove,
  disabled = false,
  label = "Imagen",
  required = false
}) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onImageRemove();
  };

  return (
    <div className="image-upload-wrapper">
      {label && (
        <label className="image-upload-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      
      <div 
        className={`image-upload-container ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload-input"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="image-upload-input"
        />
        
        <label htmlFor="image-upload-input" className="image-upload-label-area">
          {imagePreview ? (
            <div className="image-preview-container">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="image-preview"
              />
              <div className="image-preview-overlay">
                <Upload size={32} />
                <p>Click o arrastra para cambiar</p>
              </div>
              {onImageRemove && (
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={handleRemove}
                  title="Remover imagen"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ) : (
            <div className="image-upload-placeholder">
              <Upload size={48} />
              <p className="upload-main-text">
                <strong>Click para seleccionar imagen</strong>
              </p>
              <p className="upload-hint">o arrastra y suelta aquí</p>
              <p className="upload-specs">JPG, PNG o WebP (máx. 5MB)</p>
            </div>
          )}
        </label>
      </div>

      {imageFile && (
        <div className="image-upload-file-info">
          <span className="file-name">{imageFile.name}</span>
          <span className="file-size">
            {(imageFile.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      )}
    </div>
  );
}
