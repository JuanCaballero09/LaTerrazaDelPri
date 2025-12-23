import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useHealth } from "../../hooks/useHealth";
import { OrbitProgress } from "react-loading-indicators";


export function Status () {
    const navegate = useNavigate();
    const state = useHealth();

    useEffect(() => {
        const interval = setTimeout(() => {
            if (state === 'ok') {
                navegate('/');
                clearInterval(interval);
            }
        }, 3000);

        return () => clearTimeout(interval);
    }, [state]);

    return (
        <>
            <h1>API Status Page</h1>
            {state === 'checking' 
            && <OrbitProgress variant="spokes" color="#cc3131" size="large" text="Cargando" textColor="#000000" />}
            {state === 'ok' 
            && <p style={{ color: 'green' }}>API is up and running!</p>}
            {state === 'down' 
            && <p style={{ color: 'red' }}>API is down. Please try again later.</p>}
        </>
    )
}