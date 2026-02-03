import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { loginAdmin } from '../services/admin'
import { toast } from 'react-toastify'
import { AdminContext } from '../App'
import './login.css'
import logo from '../assets/hirewrite.png'

const Login = () => {
  const { setAdmin } = useContext(AdminContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signin = async () => {
    if (!email || !password) {
      toast.error('Email and password are required')
      return
    }

    try {
      const result = await loginAdmin(email, password)

      if (result.status === 'success') {
        sessionStorage.setItem('token', result.data.token)
        setAdmin({
          email: result.data.email,
          mobile: result.data.mobile,
          token: result.data.token
        })
        toast.success('Login Successful')
        navigate('/home/dashboard')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Login failed')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <img src={logo} alt="HireWrite" />
        </div>

        <h2 className="login-title">Admin Log In</h2>
        <p className="login-subtitle">Please enter your details</p>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="admin@hirewrite.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="********"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="login-options">
          <label className="remember-me">
            <input type="checkbox" /> Remember me
          </label>
          <span className="forgot">Forgot Password?</span>
        </div>

        <button className="login-btn" onClick={signin}>
          Log In
        </button>

        {/* Register link */}
        <p className="login-footer">
          Don’t have an account?
          <span
            className="auth-link"
            onClick={() => navigate('/register')}
          >
            {' '}Register
          </span>
        </p>

      </div>
    </div>
  )
}

export default Login
