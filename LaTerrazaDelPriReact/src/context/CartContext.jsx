import { createContext, useEffect, useState } from 'react'
import api from '../api/axios'

// Contexto para el carrito de compras
// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext()

// Proveedor que envuelve la app y expone la API del carrito
export function CartProvider({ children }) {
    // Estado de los items del carrito. Se inicializa desde localStorage si existe.
    const [items, setItems] = useState(() => {
        try {
            const raw = localStorage.getItem('cart')
            return raw ? JSON.parse(raw) : []
        } catch (e) {
            console.error('Error leyendo carrito desde localStorage:', e)
            return []
        }
    })
    const [isValidating, setIsValidating] = useState(false)
    
    // Estado para dirección y sede (para compartir con Checkout)
    const [address, setAddress] = useState(() => {
        try {
            return localStorage.getItem('cart_address') || ''
        } catch (e) {
            return ''
        }
    })
    const [addressData, setAddressData] = useState(() => {
        try {
            const raw = localStorage.getItem('cart_addressData')
            return raw ? JSON.parse(raw) : null
        } catch (e) {
            return null
        }
    })
    const [selectedSede, setSelectedSede] = useState(() => {
        try {
            const raw = localStorage.getItem('cart_selectedSede')
            return raw ? JSON.parse(raw) : null
        } catch (e) {
            return null
        }
    })
    const [deliveryCost, setDeliveryCost] = useState(() => {
        try {
            const raw = localStorage.getItem('cart_deliveryCost')
            return raw ? parseFloat(raw) : 0
        } catch (e) {
            return 0
        }
    })

    // Estado para tipo de entrega: 'domicilio' o 'recogida'
    const [deliveryType, setDeliveryType] = useState(() => {
        try {
            return localStorage.getItem('cart_deliveryType') || 'domicilio'
        } catch (e) {
            return 'domicilio'
        }
    })

    // Persistir cambios del carrito en localStorage
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(items))
        } catch (e) {
            console.error('Error guardando carrito en localStorage:', e)
        }
    }, [items])

    // Persistir dirección y sede en localStorage
    useEffect(() => {
        try {
            if (address) localStorage.setItem('cart_address', address)
            else localStorage.removeItem('cart_address')
        } catch (e) {
            console.error('Error guardando dirección en localStorage:', e)
        }
    }, [address])

    useEffect(() => {
        try {
            if (addressData) localStorage.setItem('cart_addressData', JSON.stringify(addressData))
            else localStorage.removeItem('cart_addressData')
        } catch (e) {
            console.error('Error guardando addressData en localStorage:', e)
        }
    }, [addressData])

    useEffect(() => {
        try {
            if (selectedSede) localStorage.setItem('cart_selectedSede', JSON.stringify(selectedSede))
            else localStorage.removeItem('cart_selectedSede')
        } catch (e) {
            console.error('Error guardando sede en localStorage:', e)
        }
    }, [selectedSede])

    useEffect(() => {
        try {
            localStorage.setItem('cart_deliveryCost', deliveryCost.toString())
        } catch (e) {
            console.error('Error guardando costo de envío en localStorage:', e)
        }
    }, [deliveryCost])

    useEffect(() => {
        try {
            localStorage.setItem('cart_deliveryType', deliveryType)
        } catch (e) {
            console.error('Error guardando tipo de entrega en localStorage:', e)
        }
    }, [deliveryType])

    // Estado y función para mostrar notificaciones (toast)
    // `toast` contiene { visible: boolean, message: string }
    const [toast, setToast] = useState({ visible: false, message: '' })

    // Mostrar toast por una duración (ms). Se puede sobreescribir pasándolo al llamar.
    const showToast = (message, ms = 2000) => {
        setToast({ visible: true, message })
        setTimeout(() => setToast({ visible: false, message: '' }), ms)
    }

    // Validar productos del carrito al cargar la aplicación
    useEffect(() => {
        const validateCartItems = async () => {
            // Si no hay items o ya está validando, no hacer nada
            if (items.length === 0 || isValidating) {
                console.log('Validación omitida:', { itemsLength: items.length, isValidating })
                return
            }

            console.log('Iniciando validación del carrito con', items.length, 'items')
            setIsValidating(true)
            
            try {
                // Obtener todos los productos disponibles desde el backend
                const response = await api.get('/productos')
                const availableProducts = response.data || []
                
                console.log('Productos disponibles del backend:', availableProducts.length)

                // Crear un mapa de productos para búsqueda rápida (incluye disponibles y no disponibles)
                const productMap = new Map()
                availableProducts.forEach(p => {
                    const key = `${p.id}-${p.type || 'Product'}`
                    productMap.set(key, p)
                })

                // Filtrar items del carrito
                const validItems = []
                const removedItems = []

                items.forEach(item => {
                    const key = `${item.id}-${item.type || 'Product'}`
                    const product = productMap.get(key)

                    console.log('Validando item:', item.nombre, { key, found: !!product, disponible: product?.disponible })

                    // Verificar si el producto existe y está disponible
                    if (product && product.disponible === true) {
                        // Actualizar precio por si cambió
                        validItems.push({
                            ...item,
                            precio: product.precio,
                            nombre: product.nombre,
                            disponible: product.disponible
                        })
                    } else {
                        // Producto no existe o no está disponible
                        removedItems.push(item)
                        console.log('Producto removido:', item.nombre, product ? 'No disponible' : 'No encontrado')
                    }
                })

                // Si hay items removidos, actualizar el carrito
                if (removedItems.length > 0) {
                    console.log('Actualizando carrito. Items válidos:', validItems.length, 'Items removidos:', removedItems.length)
                    setItems(validItems)
                    
                    // Notificar al usuario
                    const message = removedItems.length === 1
                        ? `"${removedItems[0].nombre}" ha sido eliminado del carrito (no disponible)`
                        : `${removedItems.length} productos no disponibles han sido eliminados del carrito`
                    
                    setTimeout(() => showToast(message, 5000), 100)
                } else {
                    console.log('Todos los productos del carrito están disponibles')
                }
            } catch (error) {
                console.error('Error validando productos del carrito:', error)
            } finally {
                setIsValidating(false)
            }
        }

        // Ejecutar validación después de un pequeño delay para asegurar que el componente esté montado
        const timeoutId = setTimeout(() => {
            validateCartItems()
        }, 500)

        return () => clearTimeout(timeoutId)
    }, []) // Solo ejecutar una vez al montar

    // Generar clave única para identificar items en el carrito
    // Combina id, type y tamano_selected para diferenciar productos con diferentes tamaños
    const getItemKey = (item) => {
        // Incluir el tamaño seleccionado en la clave para diferenciar productos con diferentes tamaños
        const tamano = item.tamano_selected || ''
        return `${item.id}-${item.type || 'Product'}-${tamano}`
    }

    // Agregar un producto al carrito. Si ya existe (mismo id, tipo y tamaño), incrementa su cantidad.
    // Llama a `showToast` para notificar al usuario.
    const addItem = (product, qty = 1) => {
        setItems(prev => {
            const productKey = getItemKey(product)
            const existing = prev.find(i => getItemKey(i) === productKey)
            
            if (existing) {
                const next = prev.map(i => 
                    getItemKey(i) === productKey 
                        ? { ...i, qty: i.qty + qty } 
                        : i
                )
                showToast(`${product.nombre} agregado al carrito`)
                return next
            }
            showToast(`${product.nombre} agregado al carrito`)
            return [...prev, { ...product, qty }]
        })
    }

    // Eliminar item por clave única (id + type + tamano)
    const removeItem = (item) => {
        setItems(prev => prev.filter(i => getItemKey(i) !== getItemKey(item)))
    }

    // Incrementar cantidad de un item
    const increase = (item) => {
        setItems(prev => prev.map(i => 
            getItemKey(i) === getItemKey(item) 
                ? { ...i, qty: i.qty + 1 } 
                : i
        ))
    }

    // Decrementar cantidad (mínimo 1)
    const decrease = (item) => {
        setItems(prev => prev.map(i => 
            getItemKey(i) === getItemKey(item) 
                ? { ...i, qty: Math.max(1, i.qty - 1) } 
                : i
        ))
    }

    // Vaciar carrito
    const clear = () => setItems([])

    // Valores derivados que se exponen: total de items y total en precio
    const totalItems = items.reduce((s, it) => s + (it.qty || 0), 0)
    const totalPrice = items.reduce((s, it) => s + (parseFloat(it.precio || 0) * (it.qty || 0)), 0)

    // Exponer API y estado via Context
    return (
        <CartContext.Provider value={{ 
            items, 
            addItem, 
            removeItem, 
            increase, 
            decrease, 
            clear, 
            totalItems, 
            totalPrice, 
            toast, 
            showToast,
            isValidating,
            // Datos de dirección y sede para checkout
            address,
            setAddress,
            addressData,
            setAddressData,
            selectedSede,
            setSelectedSede,
            deliveryCost,
            setDeliveryCost,
            // Tipo de entrega
            deliveryType,
            setDeliveryType
        }}>
            {children}
        </CartContext.Provider>
    )
}
