import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { getAllJobs } from '../services/admin'
import { 
  FaBriefcase, FaSearch, FaMapMarkerAlt, 
  FaClock, FaChevronLeft, FaChevronRight, FaBuilding 
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import './job.css'

const Job = () => {
  // Data States
  const [jobs, setJobs] = useState([])
  
  // UI States
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [isLoading, setIsLoading] = useState(true)

  const tableContainerRef = useRef(null)

  useEffect(() => {
    fetchJobs()
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

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const result = await getAllJobs()
      if (result.status === 'success' && Array.isArray(result.data)) {
        setJobs(result.data)
      } else {
        setJobs([])
      }
    } catch (error) {
      console.error("Load Error:", error)
      toast.error("Failed to load jobs")
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  /* ================= FILTER & PAGINATION ================= */
  const filteredJobs = (jobs || []).filter(job =>
    (job.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (job.organization_name || "").toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)

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
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage)

  /* ================= HANDLERS ================= */
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1)
  }

  return (
    <div className="job-container">
      
      {/* Header & Controls */}
      <div className="job-controls">
        <div className="title-section">
          <h3>Jobs</h3>
          <p>View all job listings and status</p>
        </div>

        <div className="controls-right">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="job-card">
        <div className="job-table-wrapper" ref={tableContainerRef}>
          
          {/* Table Header */}
          <div className="table-header">
            <div className="col-title">Job Details</div>
            <div className="col-org">Organization</div>
            <div className="col-meta">Details</div>
            <div className="col-status">Status</div>
          </div>

          {isLoading ? (
            <div className="loading-state">Loading jobs...</div>
          ) : currentJobs.length === 0 ? (
            <div className="empty-state">No jobs found.</div>
          ) : (
            <div className="table-body">
              {currentJobs.map(job => (
                <div className="table-row" key={job.job_id}>
                  
                  {/* Column 1: Job Title */}
                  <div className="col-title">
                    <div className="job-icon-wrapper">
                      <FaBriefcase />
                    </div>
                    <div className="job-text">
                      <h4>{job.title}</h4>
                      <span className="job-id">ID: {job.job_id?.substring(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Column 2: Organization */}
                  <div className="col-org">
                    <div className="org-info-row">
                        <FaBuilding className="small-icon" />
                        <span>{job.organization_name}</span>
                    </div>
                  </div>

                  {/* Column 3: Meta (Location/Type) */}
                  <div className="col-meta">
                    <div className="meta-tag">
                        <FaMapMarkerAlt /> {job.location_type}
                    </div>
                    <div className="meta-tag">
                        <FaClock /> {job.employment_type}
                    </div>
                  </div>

                  {/* Column 4: Status */}
                  <div className="col-status">
                    <span className={`status-badge ${job.status?.toLowerCase()}`}>
                        {job.status}
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
            Showing {filteredJobs.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredJobs.length)} of {filteredJobs.length}
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

export default Job