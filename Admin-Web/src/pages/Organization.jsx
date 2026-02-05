import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { 
  getAllOrganizations, 
  getBlockedOrganizations, 
  blockOrganization, 
  unblockOrganization 
} from '../services/admin' // CHECK THIS PATH matches your file structure
import { 
  FaBuilding, FaSearch, FaBan, FaCheck, 
  FaChevronLeft, FaChevronRight, FaGlobe, FaEnvelope 
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import './organization.css'

const Organization = () => {
  const [activeOrgs, setActiveOrgs] = useState([])
  const [blockedOrgs, setBlockedOrgs] = useState([])
  const [view, setView] = useState('ACTIVE') 
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingId, setLoadingId] = useState(null)
  const tableContainerRef = useRef(null)

  // Initial Load
  useEffect(() => { 
    loadData() 
  }, [])

  // Auto-calculate items per page
  useLayoutEffect(() => {
    const calculateItems = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const rowHeight = 80; 
        const headerHeight = 50;
        const availableSpace = containerHeight - headerHeight;
        const count = Math.floor(availableSpace / rowHeight);
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
      const [activeResult, blockedResult] = await Promise.all([
        getAllOrganizations(),
        getBlockedOrganizations() // FIXED: Correct function name
      ]);

      // 1. Handle Active Orgs (Backend returns { status: 'success', data: [...] })
      // We check activeResult.data because axios returns response.data, and your wrapper might add another .data
      const activeList = activeResult?.data || [];
      setActiveOrgs(Array.isArray(activeList) ? activeList : []);

      // 2. Handle Blocked Orgs (Backend returns { status: 'success', data: { blocked_organizations: [...] } })
      // We need to drill down into .blocked_organizations
      const blockedData = blockedResult?.data || {};
      const blockedList = blockedData.blocked_organizations || [];
      setBlockedOrgs(Array.isArray(blockedList) ? blockedList : []);

    } catch (error) {
      console.error("Load Error:", error)
      toast.error("Failed to load organizations")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlockToggle = async (org) => {
    setLoadingId(org.organization_id)
    try {
      const isBlocking = view === 'ACTIVE';
      const apiCall = isBlocking ? blockOrganization : unblockOrganization
      
      const res = await apiCall(org.organization_id)

      if (res && (res.status === 'success' || res.status === 200)) {
        toast.success(res.data?.message || `Organization ${isBlocking ? 'Blocked' : 'Unblocked'}`)
        
        // Optimistic UI Update: Move item between lists instantly
        if (isBlocking) {
          setActiveOrgs(prev => prev.filter(item => item.organization_id !== org.organization_id));
          setBlockedOrgs(prev => [org, ...prev]);
        } else {
          setBlockedOrgs(prev => prev.filter(item => item.organization_id !== org.organization_id));
          setActiveOrgs(prev => [org, ...prev]);
        }
      } else {
        throw new Error(res?.message || "Action failed")
      }
    } catch (error) {
      console.error("Toggle Error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoadingId(null)
    }
  }

  // Derived Data & Search Filtering
  const currentList = view === 'ACTIVE' ? activeOrgs : blockedOrgs
  
  const filteredList = currentList.filter(org =>
    (org?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (org?.email || "").toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentOrgs = filteredList.slice(startIndex, startIndex + itemsPerPage)

  // Reset page when switching views
  useEffect(() => { setCurrentPage(1) }, [view, search])

  return (
    <div className="org-container">
      <div className="org-controls">
        <div className="title-section">
          <h3>Organizations</h3>
          <p>Manage registered companies and access</p>
        </div>
        <div className="controls-right">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${view === 'ACTIVE' ? 'active' : ''}`} 
              onClick={() => setView('ACTIVE')}
            >
              Active <span className="count-badge">{activeOrgs.length}</span>
            </button>
            <button 
              className={`toggle-btn ${view === 'BLOCKED' ? 'active blocked-mode' : ''}`} 
              onClick={() => setView('BLOCKED')}
            >
              Blocked <span className="count-badge">{blockedOrgs.length}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="org-card">
        <div className="org-table-wrapper" ref={tableContainerRef}>
          <div className="table-header">
            <div className="col-info">Organization</div>
            <div className="col-contact">Contact Info</div>
            <div className="col-website">Website</div>
            <div className="col-action">Action</div>
          </div>

          {isLoading ? (
            <div className="loading-state">
               <div className="spinner"></div>
               <p>Loading organizations...</p>
            </div>
          ) : currentOrgs.length === 0 ? (
            <div className="empty-state">No {view.toLowerCase()} organizations found.</div>
          ) : (
            <div className="table-body">
              {currentOrgs.map(item => (
                <div className="table-row" key={item.organization_id}>
                  <div className="col-info">
                    <div className="org-avatar-wrapper">
                      {item.logo_url ? (
                        <img src={item.logo_url} alt="" className="org-img" />
                      ) : (
                        <div className="org-placeholder"><FaBuilding /></div>
                      )}
                    </div>
                    <div className="org-text">
                      <h4>{item.name}</h4>
                      <span className="org-id">#{item.organization_id.substring(0, 8)}...</span>
                    </div>
                  </div>

                  <div className="col-contact">
                    <div className="contact-item">
                      <FaEnvelope /> {item.email || 'No Email'}
                    </div>
                  </div>

                  <div className="col-website">
                    {item.website ? (
                      <a 
                        href={item.website.startsWith('http') ? item.website : `https://${item.website}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="website-link"
                      >
                        <FaGlobe /> {item.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="no-data">N/A</span>
                    )}
                  </div>

                  <div className="col-action">
                    <button
                      className={`action-btn ${view === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                      disabled={loadingId === item.organization_id}
                      onClick={() => handleBlockToggle(item)}
                    >
                      {loadingId === item.organization_id ? (
                        <span className="spinner-sm"></span> 
                      ) : (
                        view === 'ACTIVE' ? <><FaBan /> Block</> : <><FaCheck /> Unblock</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pagination-wrapper">
          <span className="page-info">
            Showing {filteredList.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredList.length)} of {filteredList.length}
          </span>
          <div className="page-btns">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <FaChevronLeft />
            </button>
            <button className="active-page">{currentPage}</button>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Organization