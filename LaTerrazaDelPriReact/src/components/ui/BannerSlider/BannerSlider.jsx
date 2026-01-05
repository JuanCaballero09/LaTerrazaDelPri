import { useEffect, useRef, useState } from 'react'
import LoadingDots from '../LoadingDots'
import './BannerSlider.css'
import defaultImage from '../../../assets/images/ImagenNoDisponible16-9.png'

const DEFAULT_BANNER = {
    imagen_url: defaultImage
}

export default function BannerSlider ({ banners = [], error }) {
    const slides = banners.length > 0 ? banners : [DEFAULT_BANNER]

    const [current, setCurrent] = useState(0)
    const intervalRef = useRef(null)

    const startAutoPlay = () => {
        clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
        setCurrent(prev => (prev + 1) % slides.length)
        }, 5000)
    }

    useEffect(() => {
        startAutoPlay()
        return () => clearInterval(intervalRef.current)
    }, [slides.length])

    const prev = () => {
        setCurrent((current - 1 + slides.length) % slides.length)
        startAutoPlay()
    }

    const next = () => {
        setCurrent((current + 1) % slides.length)
        startAutoPlay()
    }

    if (slides.length === 0) {
        return (
            <div className='banner-slider'>
                <div className='banner-track'>
                    <img
                        className='banner-slide'
                        src={defaultImage}
                        alt="No hay banners disponibles"
                        draggable="false" 
                        onContextMenu={e => e.preventDefault()}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className='banner-slider'>
            {error && (
                <div className='banner-error'>
                    <h3>Error al cargar los banners</h3>
                    <LoadingDots />
                    <img src="" alt="" draggable="false" onContextMenu={e => e.preventDefault()} />
                </div>
            )}

            <div
                className='banner-track' style={{transform: `translateX(-${current * 100}%)`}}>

                {slides.map((banner, index) => (
                    <img
                        key={index}
                        className='banner-slide'
                        src={banner.imagen_url}
                        alt={`Banner ${index + 1}`}
                        draggable="false" 
                        onContextMenu={e => e.preventDefault()}
                    />
                ))}
            </div>

            {slides.length > 1 && (
                <>
                    <button className='nav left' onClick={prev}>‹</button>
                    <button className='nav right' onClick={next}>›</button>

                    <div className='banner-dots'>
                        {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === current ? 'active' : ''}`}
                            onClick={() => {
                            setCurrent(index)
                            startAutoPlay()
                            }}
                        />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
