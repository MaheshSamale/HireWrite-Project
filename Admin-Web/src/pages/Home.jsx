import React, { useState } from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'
import '../components/navbar.css' // Ensure styles are loaded

function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="app-layout">
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <Navbar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            
            <div className="main-content">
                <div className="content-wrapper">
                    <Outlet context={{ toggleSidebar }} /> 
                </div>
            </div>
        </div>
    )
}

export default Home