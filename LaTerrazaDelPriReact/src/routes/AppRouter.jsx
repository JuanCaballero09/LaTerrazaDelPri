import {Routes, Route, Navigate } from 'react-router-dom'

import { Status } from '../pages/public/Status'
import Home  from '../pages/public/Home'

import CategoriaShow from '../pages/public/Categorias/Show'
import CategoriaIndex from '../pages/public/Categorias/Index'
import ProductoCategoriaIndex from '../pages/public/Categorias/Productos/index'
import ProductoShow from '../pages/public/Categorias/Productos/show'
import CartPage from '../pages/public/Cart'

// Auth pages
import Login from '../pages/public/Auth/Login'
import Register from '../pages/public/Auth/Register'
import ForgotPassword from '../pages/public/Auth/ForgotPassword'
import ResetPassword from '../pages/public/Auth/ResetPassword'
import ConfirmEmail from '../pages/public/Auth/ConfirmEmail'

// Protected pages
import ProtectedRoute from '../components/ProtectedRoute'
import Dashboard from '../pages/private/Perfil/Dashboard'
import Ordenes from '../pages/private/Perfil/Ordenes'
import Direcciones from '../pages/private/Perfil/Direcciones'
import Configuracion from '../pages/private/Perfil/Configuracion'

// Admin pages
import AdminDashboard from '../pages/private/Dashboard/Admin'

export default function AppRouter () {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/home' element={<Home />} />
            

            <Route path='/categorias' element={<CategoriaIndex />} />
            <Route path='/categoria/:id' element={<CategoriaShow />} />
            <Route path='/categoria/:id/productos' element={<ProductoCategoriaIndex />} />
            <Route path='/categoria/:categoriaSlug/producto/:productoSlug' element={<ProductoShow />} />
            
            <Route path='/carrito' element={<CartPage />} />
            
            <Route path='/status' element={<Status />} />

            {/* Auth routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path='/confirm-email' element={<ConfirmEmail />} />

            {/* Protected routes */}
            <Route path='/perfil' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/perfil/ordenes' element={<ProtectedRoute><Ordenes /></ProtectedRoute>} />
            <Route path='/perfil/direcciones' element={<ProtectedRoute><Direcciones /></ProtectedRoute>} />
            <Route path='/perfil/configuracion' element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path='/dashboard' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            
            <Route path='*' element={<Navigate to='/' />} />
        </Routes>
    )
}