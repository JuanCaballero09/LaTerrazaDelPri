import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth.api'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider ({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user') || sessionStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
    })
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || sessionStorage.getItem('token') || null
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        // placeholder: could validate token with /me
    }, [])

    const saveAuth = (tokenValue, userObj, remember) => {
        setToken(tokenValue)
        setUser(userObj)
        const storage = remember ? localStorage : sessionStorage
        storage.setItem('token', tokenValue)
        storage.setItem('user', JSON.stringify(userObj))
        const other = remember ? sessionStorage : localStorage
        other.removeItem('token')
        other.removeItem('user')
    }

    const clearAuth = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
    }

    const login = async ({ email, password, remember = false }) => {
        setLoading(true)
        try {
        const res = await authApi.login({ email, password })
        const { token: t, user: u } = res.data
        saveAuth(t, u, remember)
        setLoading(false)
        return { success: true, user: u }
        } catch (err) {
        setLoading(false)
        const message = err?.response?.data?.error || err.message
        return { success: false, error: message, errors: err?.response?.data?.errors }
        }
    }

    const register = async (form) => {
        setLoading(true)
        try {
        const res = await authApi.register({ user: form })
        setLoading(false)
        return { success: true, data: res.data }
        } catch (err) {
        setLoading(false)
        const message = err?.response?.data?.error || err.message
        return { success: false, error: message, errors: err?.response?.data?.errors }
        }
    }

    const logout = async () => {
        try {
        await authApi.logout()
        } catch {
        // ignore
        }
        clearAuth()
        navigate('/')
    }

    const forgotPassword = async (email) => {
        try {
        const res = await authApi.forgotPassword({ email })
        return { success: true, data: res.data }
        } catch (err) {
        const message = err?.response?.data?.error || err.message
        return { success: false, error: message }
        }
    }

    const resetPassword = async ({ reset_password_token, password, password_confirmation }) => {
        try {
        const res = await authApi.resetPassword({ reset_password_token, password, password_confirmation })
        return { success: true, data: res.data }
        } catch (err) {
        const message = err?.response?.data?.error || err.message
        return { success: false, error: message, errors: err?.response?.data?.errors }
        }
    }

    const resendConfirmation = async (email) => {
        try {
        const res = await authApi.resendConfirmation({ email })
        return { success: true, data: res.data }
        } catch (err) {
        const message = err?.response?.data?.error || err.message
        return { success: false, error: message }
        }
    }

    const confirmEmail = async (confirmation_token) => {
        try {
        const res = await authApi.confirmEmail({ confirmation_token })
        return { success: true, data: res.data }
        } catch (err) {
        const message = err?.response?.data?.error || err.message
        return { success: false, error: message, errors: err?.response?.data?.errors }
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, forgotPassword, resetPassword, resendConfirmation, confirmEmail }}>
        {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext () {
    return useContext(AuthContext)
}

export default AuthContext
