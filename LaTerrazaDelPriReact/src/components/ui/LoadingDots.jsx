import { useEffect, useState } from 'react'
import { ThreeDot } from 'react-loading-indicators'

export default function LoadingDots ({
    text = 'Reconectando',
    interval = 500,
    loading = true,
    color = "#fff"
    }) {
    const [dots, setDots] = useState(1)

    useEffect(() => {
        const id = setInterval(() => {
            setDots(prev => (prev === 3 ? 1 : prev + 1))
        }, interval)

        return () => clearInterval(id)
    }, [interval])

    return (
        <span>
            {text}
            {'.'.repeat(dots)}
            <br /><br />
            {loading && <ThreeDot color={color} size="medium" text="" textColor="" />}
        </span>
    )
}
