import { useEffect, useRef, useState } from "react";
import { getProductos } from "../../api/producto.api";

export default function useMenu() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const retryRef = useRef(null);

    const fetchProductos = () => {
        setLoading(true);
        getProductos()
            .then(res => {
                setProductos(res.data);
                setError(false);
                setLoading(false);

                if (retryRef.current) {
                    clearInterval(retryRef.current);
                    retryRef.current = null;
                }
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProductos();
        return () => {
            if (retryRef.current) {
                clearInterval(retryRef.current);
                retryRef.current = null;
            }
        }
    }, []);

    useEffect(() => {
        if (!error) return;
        if (!retryRef.current) {
            retryRef.current = setInterval(fetchProductos, 3000);
        }
        return () => {
            if (retryRef.current) {
                clearInterval(retryRef.current);
                retryRef.current = null;
            }
        }
    }, [error]);

    return { productos, loading, error };
}