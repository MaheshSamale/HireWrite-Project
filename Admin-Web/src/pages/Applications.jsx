import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { getAllApplications } from '../services/admin'
import { 
  FaClipboardList, FaSearch, FaUserAlt, 
  FaBuilding, FaChevronLeft, FaChevronRight, FaInfoCircle
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import './applications.css'

const Applications = () => {
  // Data States
  const [applications, setApplications] = useState([])
  
  // UI States
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [isLoading, setIsLoading] = useState(true)

  const tableContainerRef = useRef(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  // --- Dynamic Height Calculation ---
  useLayoutEffect(() => {
    const calculateItems = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const rowHeight = 80; // Height of a row
        const headerHeight = 50;
        
        const availableSpace = containerHeight - headerHeight;
        const count = Math.floor(availableSpace / rowHeight);

        // Ensure at least 4 items show
        setItemsPerPage(Math.max(count, 4));
      }
    };

    calculateItems();
    window.addEventListener('resize', calculateItems);
    return () => window.removeEventListener('resize', calculateItems);
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const result = await getAllApplications()
      if (result.status === 'success' && Array.isArray(result.data)) {
        setApplications(result.data)
      } else {
        setApplications([])
      }
    } catch (error) {
      console.error("Load Error:", error)
      toast.error("Failed to load applications")
      setApplications([])
    } finally {
      setIsLoading(false)
    }
  }

  /* ================= FILTER & PAGINATION ================= */
  const filteredApps = (applications || []).filter(app =>
    (app.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (app.organization_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (app.email || "").toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage)

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  // Safety check
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages])

  const startIndex = (currentPage - 1) * itemsPerPage
  const currentApps = filteredApps.slice(startIndex, startIndex + itemsPerPage)

  /* ================= HANDLERS ================= */
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1)
  }

  return (
    <div className="app-container">
      
      {/* Header & Controls */}
      <div className="app-controls">
        <div className="title-section">
          <h3>Applications</h3>
          <p>Track candidate applications and status</p>
        </div>

        <div className="controls-right">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="app-card">
        <div className="app-table-wrapper" ref={tableContainerRef}>
          
          {/* Table Header */}
          <div className="table-header">
            <div className="col-job">Job & Candidate</div>
            <div className="col-org">Organization</div>
            <div className="col-stage">Stage</div>
            <div className="col-decision">Decision</div>
          </div>

          {isLoading ? (
            <div className="loading-state">Loading applications...</div>
          ) : currentApps.length === 0 ? (
            <div className="empty-state">No applications found.</div>
          ) : (
            <div className="table-body">
              {currentApps.map(app => (
                <div className="table-row" key={app.application_id}>
                  
                  {/* Column 1: Job & Candidate */}
                  <div className="col-job">
                    <div className="app-icon-wrapper">
                      <FaClipboardList />
                    </div>
                    <div className="app-text">
                      <h4>{app.title}</h4>
                      <div className="sub-text">
                        <FaUserAlt className="tiny-icon"/> {app.email}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Organization */}
                  <div className="col-org">
                    <div className="org-info-row">
                        <FaBuilding className="small-icon" />
                        <span>{app.organization_name}</span>
                    </div>
                  </div>

                  {/* Column 3: Stage */}
                  <div className="col-stage">
                    <span className={`status-badge stage ${app.stage?.toLowerCase()}`}>
                        {app.stage}
                    </span>
                  </div>

                  {/* Column 4: Decision */}
                  <div className="col-decision">
                    <span className={`status-badge decision ${app.decision?.toLowerCase() || 'pending'}`}>
                        {app.decision || 'Pending'}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="pagination-wrapper">
          <span className="page-info">
            Showing {filteredApps.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredApps.length)} of {filteredApps.length}
          </span>

          <div className="page-btns">
            <button
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              <FaChevronLeft />
            </button>

            <button className="active-page" disabled>{currentPage}</button>

            <button
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={handleNextPage}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Applications