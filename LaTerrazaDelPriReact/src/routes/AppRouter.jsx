import {Routes, Route, Navigate } from 'react-router-dom'
import Home  from '../pages/Home'
import Categorias from '../pages/Categorias'
import { Status } from '../pages/Status'

export default function AppRouter () {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='*' element={<Navigate to='/' />} />
            <Route path='/status' element={<Status />} />
            <Route path='/home' element={<Home />} />
            <Route path='/categorias' element={<Categorias />} />
        </Routes>
    )
}