import { useEffect, useState, useRef } from 'react'
import { getProducto } from '../../api/producto.api'

export default function useProductoShow(categoriaId, productoId) {
    const [producto, setProducto] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const retryRef = useRef(null)

    const fetchProducto = () => {
        if (!categoriaId || !productoId) return
        setLoading(true)
        getProducto(categoriaId, productoId)
            .then(res => {
                setProducto(res.data)
                setError(false)
                setLoading(false)

                if (retryRef.current) {
                    clearInterval(retryRef.current)
                    retryRef.current = null
                }
            })
            .catch(() => {
                setError(true)
                setLoading(false)
            })
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProducto()
        return () => {
            if (retryRef.current) {
                clearInterval(retryRef.current)
                retryRef.current = null
            }
        }   
    }, [categoriaId, productoId])

    useEffect(() => {
        if (!error) return
        if (!retryRef.current) {
            retryRef.current = setInterval(fetchProducto, 3000)
        }
        return () => {
            if (retryRef.current) {
                clearInterval(retryRef.current)
                retryRef.current = null
            }
        }
    }, [error, categoriaId, productoId])

    return { producto, loading, error }
}
