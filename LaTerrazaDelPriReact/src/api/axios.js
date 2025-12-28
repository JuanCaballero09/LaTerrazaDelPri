import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Attach token from either sessionStorage or localStorage
api.interceptors.request.use(
    config => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token')
        if (token) {
            // backend expects raw token in Authorization header
            config.headers['Authorization'] = token
        }
        return config
    },
    error => Promise.reject(error)
)

api.interceptors.response.use(
    response => response,
    error => {
        if (!error.response){
            return Promise.reject(error)
        }

        if (error.response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('user')
        }

        return Promise.reject(error)
    }
)

export default api