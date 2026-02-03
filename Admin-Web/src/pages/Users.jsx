import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import {
  fetchUsersData,
  fetchBlockedUsersData,
  blockUser,
  unblockUser
} from '../services/admin'
import { 
  FaUserCircle, FaSearch, FaBan, FaCheck, 
  FaChevronLeft, FaChevronRight, FaMobileAlt, FaEnvelope
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import './users.css'

const Users = () => {
  const [activeUsers, setActiveUsers] = useState([])
  const [blockedUsers, setBlockedUsers] = useState([])
  const [view, setView] = useState('ACTIVE') 
  const [searchTerm, setSearchTerm] = useState('')
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6) // Default safe value

  const [loadingUserId, setLoadingUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const tableContainerRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  // 1. Dynamic Height Calculation
  useLayoutEffect(() => {
    const calculateItems = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const rowHeight = 72; // Height of one row
        const headerHeight = 50; 
        
        const availableSpace = containerHeight - headerHeight;
        const count = Math.floor(availableSpace / rowHeight);

        // Ensure at least 4 items show, otherwise pagination feels broken
        setItemsPerPage(Math.max(count, 4));
      }
    };

    calculateItems();
    window.addEventListener('resize', calculateItems);
    return () => window.removeEventListener('resize', calculateItems);
  }, []); 

  const loadData = async () => {
    setIsLoading(true)
    try {
      const activeRes = await fetchUsersData()
      const blockedRes = await fetchBlockedUsersData()

      if (activeRes?.status === 'success') setActiveUsers(activeRes.data)
      if (blockedRes?.status === 'success') setBlockedUsers(blockedRes.data)
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Filter & Pagination Logic
  const users = view === 'ACTIVE' ? activeUsers : blockedUsers

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile?.includes(searchTerm)
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  
  // Reset to page 1 if search changes or page becomes invalid
  useEffect(() => {
    setCurrentPage(1);
  }, [view, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  // 3. Explicit Handlers (Easier to debug)
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleBlockToggle = async (user) => {
    setLoadingUserId(user.user_id)
    const res = view === 'ACTIVE' ? await blockUser(user.user_id) : await unblockUser(user.user_id)
    if (res?.status === 'success') {
      toast.success(res.data.message)
      loadData()
    } else {
      toast.error('Action failed')
    }
    setLoadingUserId(null)
  }

  return (
    <div className="users-container">
      {/* Controls */}
      <div className="users-controls">
        <div className="title-section">
          <h3>User Management</h3>
          <p>Manage access and view user details</p>
        </div>

        <div className="controls-right">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => setView('ACTIVE')}
            >
              Active <span className="count-badge">{activeUsers.length}</span>
            </button>
            <button
              className={`toggle-btn ${view === 'BLOCKED' ? 'active blocked-mode' : ''}`}
              onClick={() => setView('BLOCKED')}
            >
              Blocked <span className="count-badge">{blockedUsers.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="users-card">
        <div className="users-table-wrapper" ref={tableContainerRef}>
            <div className="table-header">
              <div className="col-user">User Details</div>
              <div className="col-contact">Contact Info</div>
              <div className="col-role">Role</div>
              <div className="col-action">Action</div>
            </div>

            {isLoading ? (
               <div className="loading-state">Loading users...</div>
            ) : currentUsers.length === 0 ? (
               <div className="empty-state">No users found.</div>
            ) : (
                <div className="table-body">
                    {currentUsers.map(user => (
                    <div key={user.user_id} className="table-row">
                        <div className="col-user">
                            <div className="user-avatar-wrapper">
                                {user.profile_photo_url ? (
                                <img src={user.profile_photo_url} alt="" className="avatar-img" />
                                ) : (
                                <div className="avatar-placeholder"><FaUserCircle /></div>
                                )}
                            </div>
                            <div className="user-text">
                                <h4>{user.name}</h4>
                                <span className="user-id">ID: {user.user_id}</span>
                            </div>
                        </div>

                        <div className="col-contact">
                            <div className="contact-item"><FaEnvelope /> {user.email}</div>
                            {user.mobile && <div className="contact-item"><FaMobileAlt /> {user.mobile}</div>}
                        </div>

                        <div className="col-role">
                            <span className={`role-badge ${user.role?.toLowerCase()}`}>{user.role || 'User'}</span>
                        </div>

                        <div className="col-action">
                            <button
                                className={`action-btn ${view === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                                disabled={loadingUserId === user.user_id}
                                onClick={() => handleBlockToggle(user)}
                            >
                                {loadingUserId === user.user_id ? <span className="spinner"></span> : 
                                  view === 'ACTIVE' ? <><FaBan /> Block</> : <><FaCheck /> Unblock</>
                                }
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
            )}
        </div>

        {/* 4. Pagination Footer */}
        <div className="pagination-wrapper">
            <span className="page-info">
              Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
            </span>
            
            <div className="page-btns">
              <button
                type="button" 
                disabled={currentPage === 1}
                onClick={handlePrevPage}
                className="nav-btn"
              >
                <FaChevronLeft />
              </button>
              
              <button className="active-page" disabled>{currentPage}</button>
              
              <button
                type="button"
                disabled={currentPage >= totalPages || totalPages === 0}
                onClick={handleNextPage}
                className="nav-btn"
              >
                <FaChevronRight />
              </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Users