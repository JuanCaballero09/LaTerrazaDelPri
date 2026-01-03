import { useState } from 'react'

/**
 * Hook para manejar el estado de carga de imágenes
 * @returns {Object} Estado y funciones para manejar la carga de imágenes
 */
export function useImageLoader() {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    const handleImageLoad = () => {
        setImageLoaded(true)
        setImageError(false)
    }

    const handleImageError = (e, fallbackSrc) => {
        setImageError(true)
        setImageLoaded(true)
        if (e?.target && fallbackSrc) {
            e.target.src = fallbackSrc
        }
    }

    const resetImageState = () => {
        setImageLoaded(false)
        setImageError(false)
    }

    return {
        imageLoaded,
        imageError,
        handleImageLoad,
        handleImageError,
        resetImageState
    }
}
