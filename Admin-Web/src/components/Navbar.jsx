import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import {
  FaTachometerAlt, FaUsers, FaBuilding, FaBriefcase, 
  FaClipboardList, FaHistory, FaCog, FaUserCircle, 
  FaSignOutAlt, FaTimes
} from 'react-icons/fa'
import { fetchProfile } from '../services/admin'
import { toast } from 'react-toastify'
import logo from '../assets/hirewrite.png'
import './navbar.css'

function Navbar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)

  const logout = () => {
    sessionStorage.removeItem('token')
    navigate('/')
  }

  useEffect(() => {
    getProfileData()
  }, [])

  const getProfileData = async () => {
    try {
      const result = await fetchProfile()
      if (result.status === 'success' && result.data.length > 0) {
        setAdmin(result.data[0])
      }
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-container">
           {/* If you don't have a logo image yet, use text as fallback */}
           {logo ? <img src={logo} alt="Logo" className="logo-img" /> : <h3>HireWrite</h3>}
        </div>
        <button className="close-btn" onClick={toggleSidebar}>
            <FaTimes />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="menu-label">MENU</p>
        <ul>
          <li>
            <NavLink to="/home/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={toggleSidebar}>
              <FaTachometerAlt className="nav-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/home/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={toggleSidebar}>
              <FaUsers className="nav-icon" />
              <span>Users</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/home/organization" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={toggleSidebar}>
              <FaBuilding className="nav-icon" />
              <span>Organizations</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/home/job" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={toggleSidebar}>
              <FaBriefcase className="nav-icon" />
              <span>Jobs</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/home/applications" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={toggleSidebar}>
              <FaClipboardList className="nav-icon" />
              <span>Applications</span>
            </NavLink>
          </li>
        </ul>

        <p className="menu-label">SYSTEM</p>
        <ul>
          <li>
            <NavLink to="/home/audit" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={toggleSidebar}>
              <FaHistory className="nav-icon" />
              <span>Audit Log</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/home/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={toggleSidebar}>
              <FaCog className="nav-icon" />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Footer / Profile */}
      <div className="sidebar-footer">
        <div className="user-card">
          {admin?.profile_photo_url ? (
            <img 
              src={"https://hirewrite-project.onrender.com" + admin.profile_photo_url} 
              alt="Admin" 
              className="user-avatar" 
            />
          ) : (
            <div className="user-avatar-placeholder">
                <FaUserCircle />
            </div>
          )}
          
          <div className="user-info">
            <span className="user-name">{admin?.name || "Admin User"}</span>
            <span className="user-email">{admin?.email || "admin@hirewrite.com"}</span>
          </div>
          
          <button onClick={logout} className="logout-icon-btn" title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Navbar
