import { createContext, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { ToastContainer } from 'react-toastify'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import Users from './pages/Users'
import Candidate from './pages/Candidate'
import Organization from './pages/Organization'
import Job from './pages/Job'
import Applications from './pages/Applications'
import Audit from './pages/Audit'
import Settings from './pages/Settings'

export const AdminContext = createContext()

function App() {
  const [admin, setAdmin] = useState(() => {
    const token = sessionStorage.getItem('token')
    return token ? { token } : null
  })

  return (
    <>
      <AdminContext.Provider value={{ admin, setAdmin }}>
        <Routes>

          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={admin ? <Home /> : <Navigate to="/" />}
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="candidate" element={<Candidate />} />
            <Route path="organization" element={<Organization />} />
            <Route path="job" element={<Job />} />
            <Route path="applications" element={<Applications />} />
            <Route path="audit" element={<Audit />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </AdminContext.Provider>

      <ToastContainer />
    </>
  )
}

export default App
