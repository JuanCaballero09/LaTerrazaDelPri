import { useEffect, useState, useRef } from "react";
import { getCategorias } from "../../api/categorias.api";

export function useCategoriaIndex () {
    const [categorias, setCategorias ] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const retryRef = useRef(null)

    const fetchCategorias = () =>{
        getCategorias()
            .then(res => {
                setCategorias(res.data)
                setError(false)
                setLoading(false)

                if (retryRef.current) {
                    clearInterval(retryRef.current)
                    retryRef.current = null
                }
            })
            .catch(()=> {
                setError(true)
                setLoading(false)
            })
    }

    useEffect(()=>{
        fetchCategorias()
    }, [])

    useEffect(() => {
        if (!error) return
        
        retryRef.current = setInterval(() => {
            fetchCategorias()
        }, 3000)

    }, [error])
    
    return { categorias, loading, error }
}