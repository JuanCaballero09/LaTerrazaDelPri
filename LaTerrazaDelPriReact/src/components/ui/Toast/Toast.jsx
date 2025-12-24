
import useCart from '../../../hooks/useCart'

import './Toast.css'

export default function Toast(){
  const { toast } = useCart()
  if (!toast?.visible) return null
  return (
    <div className="toast-container">
      <h1 className="toast-message">{toast.message}</h1>
    </div>
  )
}
