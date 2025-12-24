import { createContext, useEffect, useState } from 'react'

// Contexto para el carrito de compras
export const CartContext = createContext()

// Proveedor que envuelve la app y expone la API del carrito
export function CartProvider({ children }) {
    // Estado de los items del carrito. Se inicializa desde localStorage si existe.
    const [items, setItems] = useState(() => {
        try {
            const raw = localStorage.getItem('cart')
            return raw ? JSON.parse(raw) : []
        } catch (e) {
            return []
        }
    })

    // Persistir cambios del carrito en localStorage
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(items))
        } catch (e) {}
    }, [items])

    // Estado y función para mostrar notificaciones (toast)
    // `toast` contiene { visible: boolean, message: string }
    const [toast, setToast] = useState({ visible: false, message: '' })

    // Mostrar toast por una duración (ms). Se puede sobreescribir pasándolo al llamar.
    const showToast = (message, ms = 2000) => {
        setToast({ visible: true, message })
        setTimeout(() => setToast({ visible: false, message: '' }), ms)
    }

    // Agregar un producto al carrito. Si ya existe, incrementa su cantidad.
    // Llama a `showToast` para notificar al usuario.
    const addItem = (product, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id && i.type === product.type)
            if (existing) {
                const next = prev.map(i => i.id === product.id && i.type === product.type ? { ...i, qty: i.qty + qty } : i)
                showToast(`${product.nombre} agregado al carrito`)
                return next
            }
            showToast(`${product.nombre} agregado al carrito`)
            return [...prev, { ...product, qty }]
        })
    }

    // Eliminar item por id
    const removeItem = (id) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    // Incrementar cantidad de un item
    const increase = (id) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i))
    }

    // Decrementar cantidad (mínimo 1)
    const decrease = (id) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
    }

    // Vaciar carrito
    const clear = () => setItems([])

    // Valores derivados que se exponen: total de items y total en precio
    const totalItems = items.reduce((s, it) => s + (it.qty || 0), 0)
    const totalPrice = items.reduce((s, it) => s + (parseFloat(it.precio || 0) * (it.qty || 0)), 0)

    // Exponer API y estado via Context
    return (
        <CartContext.Provider value={{ items, addItem, removeItem, increase, decrease, clear, totalItems, totalPrice, toast, showToast }}>
            {children}
        </CartContext.Provider>
    )
}
