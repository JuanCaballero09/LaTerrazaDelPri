import { useEffect, useState } from 'react'
import { healthCheck } from '../api/health.api'

export function useHealth () {
    const [status, setStatus] = useState('checking')

    useEffect(() => {
        const interval = setInterval(() => {
            healthCheck()
                .then(res => {
                    setStatus('ok')
                    console.log(res.data)
                    clearInterval(interval)
                })
                .catch(err => {
                    setStatus('down')
                    console.error(err.data)
                })
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return status
}
