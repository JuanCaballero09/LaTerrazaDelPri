import MainLayout from '../../layouts/MainLayout'
import { useState } from 'react'
import useCart from '../../hooks/useCart'
import './Cart.css'

export default function CartPage(){
    const { items, increase, decrease, removeItem, totalItems, totalPrice, clear } = useCart()
    const [address, setAddress] = useState('')
    const [paid, setPaid] = useState(false)

    const handlePay = () => {
        if (!address) return alert('Por favor ingresa una dirección')
        // simple simulated payment
        setPaid(true)
        clear()
    }

    return (
        <MainLayout>
            <section className="page-content">
                <div className="cart-container">
                <div className="cart-items">
                    <h2>Carrito ({totalItems})</h2>
                    {items.length === 0 ? (
                    <p>El carrito está vacío</p>
                    ) : (
                    items.map(item => (
                        <div className="cart-item" key={item.id}>
                        <img src={item.imagen_url} alt={item.nombre} />
                        <div className="cart-item-body">
                            <h4>{item.nombre}</h4>
                            {item.ingredientes && item.ingredientes.length > 0 && (
                            <small>{item.ingredientes.slice(0,3).join(', ')}{item.ingredientes.length>3? '...':''}</small>
                            )}
                            <div className="cart-controls">
                            <button onClick={() => decrease(item.id)}>-</button>
                            <span>{item.qty}</span>
                            <button onClick={() => increase(item.id)}>+</button>
                            <button className="remove" onClick={() => removeItem(item.id)}>Eliminar</button>
                            </div>
                        </div>
                        <div className="cart-item-price">{(parseFloat(item.precio||0) * item.qty).toFixed(2).replace('.', ',')} COP</div>
                        </div>
                    ))
                    )}
                </div>

                <aside className="cart-checkout">
                    <h3>Resumen</h3>
                    <p>Items: {totalItems}</p>
                    <p>Total: {totalPrice.toFixed(2).replace('.', ',')} COP</p>

                    {paid ? (
                    <div className="paid-msg">Pago realizado. Gracias!</div>
                    ) : (
                    <>
                        <label>Dirección</label>
                        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Dirección de envío" />
                        <button className="btn-pay" onClick={handlePay}>Pagar</button>
                    </>
                    )}

                </aside>
                </div>
            </section>
        </MainLayout>
    )
}
