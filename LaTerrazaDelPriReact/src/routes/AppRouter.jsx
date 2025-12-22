import {Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import { Status } from '../pages/Status'

export default function AppRouter () {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/status' element={<Status />} />
            <Route path='/home' element={<Home />} />
        </Routes>
    )
}