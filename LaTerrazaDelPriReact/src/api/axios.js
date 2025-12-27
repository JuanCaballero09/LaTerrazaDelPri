import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.response.use(
    response => response,
    error => {
        if (!error.response){
            // console.error("Servidor no disponible")
            return Promise.reject(error)
        }

        if (error.response.status === 401) {
            localStorage.removeItem('token')
        }

        // Rechazar con el Error original mantiene `error.message` y stack.
        return Promise.reject(error)
    }
)

export default api