import { useRef, useState } from "react";
import { getCategoria } from "../../api/categorias.api";

export default function useCategoriaShow(id) {
    const [categoria, setCategoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const retryRef = useRef(null);

    const fetchCategoria = () => {
        if (!id) return;

        setLoading(true);

        getCategoria(id)
            .then(res => {
                setCategoria(res.data);
                setError(false);
                setLoading(false);

                if (retryRef.current) {
                    clearInterval(retryRef.current);
                    retryRef.current = null;
                }
            })
            .catch(() => {
                setError(true);
            })
    };

    return { categoria, loading, error, fetchCategoria};
}
