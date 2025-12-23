import { useState } from "react";
import { getCategoria } from "../../api/categorias.api";

export default function useCategoriaShow() {
    const [categoria, setCategoria ] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const fetchCategoria = (id) => {
        
        setLoading(true)

        getCategoria(id)
            .then(res => {
                setCategoria(res.data)
                setError(false)
                setLoading(false)
            })
            .catch(()=> {
                setError(true)
                setLoading(false)
            })
        }

    return { categoria, loading, error, fetchCategoria }
}