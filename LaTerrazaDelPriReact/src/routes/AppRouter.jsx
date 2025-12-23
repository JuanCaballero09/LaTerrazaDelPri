import {Routes, Route, Navigate } from 'react-router-dom'

import { Status } from '../pages/public/Status'

import Home  from '../pages/public/Home'

import CategoriaShow from '../pages/public/Categorias/Show'
import CategoriaIndex from '../pages/public/Categorias/Index'
import ProductoCategoriaIndex from '../pages/public/Categorias/Productos/index'

export default function AppRouter () {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/home' element={<Home />} />
            

            <Route path='/categorias' element={<CategoriaIndex />} />
            <Route path='/categoria/:id' element={<CategoriaShow />} />
            <Route path='/categoria/:id/productos' element={<ProductoCategoriaIndex />} />
            {/* <Route path='/categoria/:categoria/productos' element={<ProductoCategoriaIndex />} /> */}
            
            <Route path='/status' element={<Status />} />
            <Route path='*' element={<Navigate to='/' />} />
        </Routes>
    )
}