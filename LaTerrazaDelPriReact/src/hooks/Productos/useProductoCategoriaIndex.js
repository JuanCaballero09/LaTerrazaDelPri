
import { useEffect, useState } from "react";
import { getProductsByCategoria } from "../../api/categorias.api";
import { useParams } from "react-router-dom";

export default function useProductosPorCategoria () {
    const { id } = useParams();

    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const fetchProductos = () => {
        getProductsByCategoria(id)
            .then(res => {
                setProductos(res.data);
                setError(false);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
            })
    }

    useEffect(() => {
        if (!id) return;

        fetchProductos();
    }, [id]);

    useEffect(() => {
        if (!error) return;

        const retryInterval = setInterval(fetchProductos, 3000);

        return () => {
            clearInterval(retryInterval);
        };
    }, [error]);

    return { productos, loading, error }
}