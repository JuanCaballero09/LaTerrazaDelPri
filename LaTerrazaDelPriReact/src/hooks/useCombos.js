import { useEffect, useState, useRef } from "react";
import { getCombos } from "../api/combos.api";

export function useCombos () {
    const [combos, setCombos ] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const retryRef = useRef(null)

    const fetchCombos = () =>{
        getCombos()
            .then(res => {
                setCombos(res.data)
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
        fetchCombos()
    }, [])

    useEffect(() => {
        if (!error) return
        
        retryRef.current = setInterval(() => {
            fetchCombos()
        }, 3000)

    }, [error])
    
    return { combos, loading, error }
}