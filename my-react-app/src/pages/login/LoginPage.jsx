import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/utils/error'
import '@/pages/login/login.css'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <form className="login__card card" onSubmit={handleSubmit}>
        <h1 className="login__title">Banjara Ghar</h1>
        <p className="login__subtitle">Admin panel sign in</p>

        {error && <div className="login__error">{error}</div>}

        <div className="field">
          <label className="field__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn btn--primary login__submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}