import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { registerAdmin } from '../services/admin'
import { toast } from 'react-toastify'
import './register.css'
import logo from '../assets/hirewrite.png'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mobile, setMobile] = useState('')

  const signup = async () => {
    if (!name || !email || !password || !mobile) {
      toast.error('All fields are required')
      return
    }

    try {
      const result = await registerAdmin(name, email, password, mobile)

      if (result.status === 'success') {
        toast.success('Signup Successful')
        navigate('/login')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Registration failed')
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-logo">
          <img src={logo} alt="HireWrite" />
        </div>

        <h2 className="register-title">Create Admin Account</h2>
        <p className="register-subtitle">Please fill in your details</p>

        <div className="input-group">
          <label>Name</label>
          <input type="text" onChange={e => setName(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input type="email" onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type="password" onChange={e => setPassword(e.target.value)} />
          <small className="password-hint">
            8–20 characters, letters & numbers only
          </small>
        </div>

        <div className="input-group">
          <label>Mobile</label>
          <input type="tel" onChange={e => setMobile(e.target.value)} />
        </div>

        <button className="register-btn" onClick={signup}>
          Sign Up
        </button>

        {/* Back to Login */}
        <p className="register-footer">
          Already have an account?
          <span
            className="auth-link"
            onClick={() => navigate('/login')}
          >
            {' '}Log In
          </span>
        </p>

      </div>
    </div>
  )
}

export default Register
