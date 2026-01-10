import {Routes, Route, Navigate } from 'react-router-dom'

import { Status } from '../pages/public/Status'
import Home  from '../pages/public/Home'

import CategoriaShow from '../pages/public/Categorias/Show'
import CategoriaIndex from '../pages/public/Categorias/Index'
import ProductoCategoriaIndex from '../pages/public/Categorias/Productos/index'
import ProductoShow from '../pages/public/Categorias/Productos/show'
import CartPage from '../pages/public/Cart'
import Checkout from '../pages/public/Checkout'

import Menu from '../pages/public/Menu'

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
import OrdenDetalle from '../pages/private/Perfil/OrdenDetalle'
import Direcciones from '../pages/private/Perfil/Direcciones'
import Configuracion from '../pages/private/Perfil/Configuracion'

// Admin Layout & Pages
import { DashboardLayout } from '../layouts/DashboardLayout'
import { DashboardMain } from '../pages/private/Dashboard/DashboardMain'
import { DashboardMainEnhanced } from '../pages/private/Dashboard/DashboardMainEnhanced'
import { DashboardMainMinimal } from '../pages/private/Dashboard/DashboardMainMinimal'
import { ProductosCRUD } from '../pages/private/Dashboard/ProductosCRUD'
import { OrdenesCRUD } from '../pages/private/Dashboard/OrdenesCRUD'
import { BannersCRUD } from '../pages/private/Dashboard/BannersCRUD'
import { GruposCRUD } from '../pages/private/Dashboard/GruposCRUD'
import { IngredientesCRUD } from '../pages/private/Dashboard/IngredientesCRUD'
import { UsersCRUD } from '../pages/private/Dashboard/UsersCRUD'
import SedesCRUD from '../pages/private/Dashboard/SedesCRUD'
import { ComingSoon } from '../pages/private/Dashboard/ComingSoon'
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

            <Route path='/menu' element={<Menu />} />
            
            <Route path='/carrito' element={<CartPage />} />
            <Route path='/checkout' element={<Checkout />} />
            
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
            <Route path='/perfil/orden/:code' element={<ProtectedRoute><OrdenDetalle /></ProtectedRoute>} />
            <Route path='/perfil/direcciones' element={<ProtectedRoute><Direcciones /></ProtectedRoute>} />
            <Route path='/perfil/configuracion' element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />

            {/* Admin routes with Dashboard Layout */}
            <Route path='/admin' element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path='dashboard' element={<DashboardMainMinimal />} />
                <Route path='productos' element={<ProductosCRUD />} />
                <Route path='ordenes' element={<OrdenesCRUD />} />
                <Route path='grupos' element={<GruposCRUD />} />
                <Route path='ingredientes' element={<IngredientesCRUD />} />
                <Route path='usuarios' element={<UsersCRUD />} />
                <Route path='sedes' element={<SedesCRUD />} />
                <Route path='banners' element={<BannersCRUD />} />
                <Route index element={<Navigate to='dashboard' replace />} />
            </Route>
            
            {/* Legacy admin route */}
            <Route path='/dashboard' element={<Navigate to='/admin/dashboard' replace />} />
            
            <Route path='*' element={<Navigate to='/' />} />
        </Routes>
    )
}