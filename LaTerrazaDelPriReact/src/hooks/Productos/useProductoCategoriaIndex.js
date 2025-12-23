
import { useEffect, useState } from "react";
import { getProductsByCategoria } from "../../api/categorias.api";
import { useParams } from "react-router-dom";

export default function useProductosPorCategoria () {
    const { id } = useParams();

    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!id) return;

        getProductsByCategoria(id)
            .then(res => {
                setProductos(res.data);
                setError(false);
            })
            .catch(() => {
                setError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    return { productos, loading, error }
}