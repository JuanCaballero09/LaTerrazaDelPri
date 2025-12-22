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

        return Promise.reject(error.response)
    }
)

export default api