import { useState, useEffect, useRef, useCallback } from 'react'
import { buscarProductos } from '../api/busqueda.api'

export default function useBusqueda(initial = '') {
    const [query, setQuery] = useState(initial)
    const [results, setResults] = useState({ productos: [], grupos: [], total: 0 })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const lastQueryRef = useRef('')
    const timeoutRef = useRef(null)

    const fetchWithRetry = useCallback(async (q, maxAttempts = 3) => {
        setLoading(true)
        setError(null)
        let attempt = 0
        while (attempt < maxAttempts) {
            try {
                const data = await buscarProductos(q)
                
                if ((!data.productos || data.productos.length === 0) && (!data.grupos || data.grupos.length === 0)) {
                    throw new Error('No hay productos con ese nombre')
                }

                setResults(data)
                setLoading(false)
                return data
            } catch (err) {
                attempt += 1
                if (attempt >= maxAttempts) {
                    setError(err)
                    setLoading(false)
                    throw err
                }
                // Exponential backoff
                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt - 1)))
            }
        }
    }, [])

    useEffect(() => {
        if (!query || query.trim() === '') {
        setResults({ productos: [], grupos: [], total: 0 })
        setLoading(false)
        setError(null)
        return undefined
        }

        lastQueryRef.current = query
        // Limpiar resultados inmediatamente cuando cambia la consulta
        setResults({ productos: [], grupos: [], total: 0 })
        setError(null)
        setLoading(true)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
        fetchWithRetry(query).catch(() => {})
        }, 300)

        return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [query, fetchWithRetry])

    const reconnect = async () => {
        if (!lastQueryRef.current) return null
        return fetchWithRetry(lastQueryRef.current)
    }

    const clear = () => {
        setQuery('')
        setResults({ productos: [], grupos: [], total: 0 })
        setError(null)
        setLoading(false)
    }

    

    return { query, setQuery, results, loading, error, reconnect, clear }
}
