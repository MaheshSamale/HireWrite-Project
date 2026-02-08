import React, { useState, useEffect } from "react";
import { NavLink, useOutletContext } from "react-router"; // useOutletContext to get toggle function
import {
  FaRegStar, FaRegEdit, FaRegCommentDots, FaUserCircle, 
  FaBuilding, FaBars, FaArrowRight, FaSearch
} from "react-icons/fa";
import { fetchAdminData, getAllCandidates, getAllOrganizations } from "../services/admin";
import { toast } from "react-toastify";
import "./dashboard.css";

const Dashboard = () => {
  // Use context if you passed it from Home, otherwise optional chaining handles it
  const context = useOutletContext(); 
  const toggleSidebar = context ? context.toggleSidebar : () => {};

  const [dashboardData, setDashboardData] = useState({
    Users: 0, Organizations: 0, Jobs: 0, Applications: 0
  });
  const [candidates, setCandidates] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dashRes, candRes, orgRes] = await Promise.all([
          fetchAdminData(),
          getAllCandidates(),
          getAllOrganizations()
        ]);

        if (dashRes.status === "success") setDashboardData(dashRes.data);
        if (candRes.status === "success") setCandidates(candRes.data);
        if (orgRes.status === "success") setOrganizations(orgRes.data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={toggleSidebar}>
            <FaBars />
        </button>
        <h2>Dashboard</h2>
        <div className="user-mob">
            <FaUserCircle />
        </div>
      </div>

      {/* Hero / Welcome Section */}
      <div className="dashboard-hero">
        <div>
            <h1>Welcome back, Admin! 👋</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {Object.entries(dashboardData).map(([key, value]) => (
          <div className="stat-card" key={key}>
            <div className="stat-info">
                <p className="stat-label">{key}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
            <div className={`stat-icon-bg icon-${key.toLowerCase()}`}>
                {key === 'Users' && <FaUserCircle />}
                {key === 'Organizations' && <FaBuilding />}
                {key === 'Jobs' && <FaRegEdit />}
                {key === 'Applications' && <FaRegStar />}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        
        {/* Candidates Section */}
        <div className="card-section">
          <div className="card-header">
            <h3>Recent Candidates</h3>
            <NavLink to="/home/candidate" className="view-link">View All</NavLink>
          </div>
          
          <div className="list-container">
            {candidates.length === 0 && !loading ? (
                <div className="empty-state">No candidates found</div>
            ) : (
                candidates.slice(0, 5).map((item, index) => (
                    <div className="list-item" key={index}>
                        <div className="item-left">
                            {item.profile_photo_url ? (
                                <img src={item.profile_photo_url} alt={item.name} className="item-avatar" />
                            ) : (
                                <div className="item-avatar-placeholder"><FaUserCircle /></div>
                            )}
                            <div className="item-details">
                                <h4>{item.name || "Unknown Candidate"}</h4>
                                <span>{item.email}</span>
                            </div>
                        </div>
                        <div className="item-actions">
                            <button className="icon-btn"><FaRegCommentDots /></button>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Organizations Section */}
        <div className="card-section">
          <div className="card-header">
            <h3>Active Organizations</h3>
            <NavLink to="/home/organization" className="view-link">View All</NavLink>
          </div>

          <div className="list-container">
             {organizations.length === 0 && !loading ? (
                <div className="empty-state">No organizations found</div>
            ) : (
                organizations.slice(0, 5).map((item) => (
                    <div className="list-item" key={item.organization_id}>
                        <div className="item-left">
                            {item.logo_url ? (
                                <img src={item.logo_url} alt={item.name} className="item-logo" />
                            ) : (
                                <div className="item-logo-placeholder"><FaBuilding /></div>
                            )}
                            <div className="item-details">
                                <h4>{item.name}</h4>
                                <a href={item.website} target="_blank" rel="noreferrer" className="sub-link">
                                    {item.website || "No website"}
                                </a>
                            </div>
                        </div>
                        <div className="item-actions">
                             <button className="icon-btn"><FaArrowRight /></button>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;