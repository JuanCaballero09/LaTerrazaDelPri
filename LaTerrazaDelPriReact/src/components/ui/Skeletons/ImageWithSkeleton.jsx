import { useState, useEffect, useRef } from 'react'
import './ImageWithSkeleton.css'
import './Skeleton.css'

export default function ImageWithSkeleton({ src, alt, fallbackSrc, className = '' }) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const imgRef = useRef(null)
    const currentSrc = useRef(src)

    // Reset state cuando cambia la URL de la imagen
    useEffect(() => {
        // Solo resetear si la URL realmente cambió
        if (currentSrc.current !== src) {
            currentSrc.current = src
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImageLoaded(false)
        }
        
        // Verificar si la imagen ya está cargada
        const checkImage = () => {
            const img = imgRef.current
            if (img) {
                // Si la imagen ya se completó (cache o carga rápida)
                if (img.complete) {
                    // Verificar si realmente cargó o falló
                    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                        setImageLoaded(true)
                    } else if (img.naturalWidth === 0) {
                        // La imagen falló al cargar, usar fallback
                        if (fallbackSrc && img.src !== fallbackSrc) {
                            img.src = fallbackSrc
                        }
                        setImageLoaded(true)
                    }
                }
            }
        }

        // Verificar inmediatamente y después de un pequeño delay
        checkImage()
        const timer = setTimeout(checkImage, 10)
        
        return () => clearTimeout(timer)
    }, [src, fallbackSrc])

    if (!src && fallbackSrc) {
        return <img src={fallbackSrc} alt={alt} className={className} />
    }

    const handleLoad = () => {
        setImageLoaded(true)
    }

    const handleError = (e) => {
        if (e.target && fallbackSrc && e.target.src !== fallbackSrc) {
            e.target.src = fallbackSrc
        }
        setImageLoaded(true)
    }

    return (
        <div className="image-with-skeleton-wrapper">
            {!imageLoaded && <div className="image-skeleton-placeholder skeleton" />}
            <img
                ref={imgRef}
                src={src || fallbackSrc}
                alt={alt}
                draggable="false"
                onContextMenu={e => e.preventDefault()}
                onLoad={handleLoad}
                onError={handleError}
                style={{ display: imageLoaded ? 'block' : 'none' }}
                className={className}
            />
        </div>
    )
}
