import { useState, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

/**
 * useApi — generic authenticated API hook
 * Usage:
 *   const { data, loading, error, execute } = useApi()
 *   await execute('get', '/api/admin/orders/ebooks')
 */
export function useApi() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { admin } = useAuth()

  const execute = useCallback(async (method, url, payload = null) => {
    setLoading(true)
    setError(null)
    try {
      const config = {
        method,
        url,
        headers: admin?.token ? { Authorization: `Bearer ${admin.token}` } : {},
      }
      if (payload) config.data = payload

      const response = await axios(config)
      setData(response.data)
      return response.data
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Request failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [admin])

  return { data, loading, error, execute }
}

/**
 * usePayment — handles Stripe + Paystack payment flows
 */
export function usePayment() {
  const [loading, setLoading] = useState(false)

  const initiatePaystack = async ({ email, name, bookId }) => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/payments/paystack/initialize', { email, name, bookId })
      if (data.authorization_url) window.location.href = data.authorization_url
    } finally {
      setLoading(false)
    }
  }

  const initiateStripe = async ({ email, name, bookId }) => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/payments/stripe/create-session', {
        email, name, bookId,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/books`,
      })
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return { loading, initiatePaystack, initiateStripe }
}
