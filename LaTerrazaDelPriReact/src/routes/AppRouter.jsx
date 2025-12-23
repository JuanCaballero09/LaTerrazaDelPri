import {Routes, Route, Navigate } from 'react-router-dom'

import { Status } from '../pages/public/Status'

import Home  from '../pages/public/Home'

import CategoriaShow from '../pages/public/Categorias/CategoriaShow'
import CategoriaIndex from '../pages/public/Categorias/CategoriaIndex'

export default function AppRouter () {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='*' element={<Navigate to='/' />} />
            
            <Route path='/status' element={<Status />} />
            
            <Route path='/home' element={<Home />} />

            <Route path='/categorias' element={<CategoriaIndex />} />
            <Route path='/categoria/:id' element={<CategoriaShow />} />
        </Routes>
    )
}