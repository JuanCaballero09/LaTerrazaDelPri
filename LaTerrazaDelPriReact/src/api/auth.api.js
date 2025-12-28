import api from './axios'

export const login = data => api.post('/login', data)
export const register = data => api.post('/register', data)
export const logout = () => api.post('/logout')

export const forgotPassword = data => api.post('/forgot_password', data)
export const resetPassword = data => api.post('/reset_password', data)
export const resendConfirmation = data => api.post('/resend_confirmation', data)
export const confirmEmail = params => api.get('/confirm_email', { params })

export const me = () => api.get('/me')
