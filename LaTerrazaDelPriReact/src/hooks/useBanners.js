import { useEffect, useState, useRef } from "react";
import { getBanners } from '../api/banners.api'

export function useBanners (){
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const retryRef = useRef(null)

    const fetchBanners = () => {
        getBanners()
            .then(res => {
                setBanners(res.data)
                setError(false)
                setLoading(false)

                if (retryRef.current) {
                    clearInterval(retryRef.current)
                    retryRef.current = null
                }
            })
            .catch(()=>{
                setError(true)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchBanners()
    }, [])

    useEffect(() => {
        if (!error) return

        retryRef.current = setInterval(fetchBanners, 3000)
        return () => clearInterval(retryRef.current)

    }, [error])

    return { banners, loading, error }
}