import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute ({ children, requiredRole = null }) {
    const { user, token } = useAuth()

    if (!user || !token) {
        return <Navigate to='/login' replace />
    }

    // Si se requiere un rol específico, verificar
    if (requiredRole && user.rol?.toLowerCase() !== requiredRole.toLowerCase()) {
        return <Navigate to='/admin/dashboard' replace />
    }

    return children
}
