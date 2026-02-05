import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { getAuditLogs } from '../services/admin'
import { 
  FaHistory, FaSearch, FaChevronLeft, FaChevronRight, 
  FaClock, FaTag, FaBuilding, FaUser, FaBriefcase, FaAlignLeft
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import './audit.css'

const Audit = () => {
  const [auditLogs, setAuditLogs] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [isLoading, setIsLoading] = useState(true)

  const tableContainerRef = useRef(null)

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  useLayoutEffect(() => {
    const calculateItems = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const rowHeight = 72; 
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

  const fetchAuditLogs = async () => {
    setIsLoading(true)
    try {
      const result = await getAuditLogs()
      if (result.status === 'success' && Array.isArray(result.data)) {
        setAuditLogs(result.data)
      } else {
        setAuditLogs([])
      }
    } catch (error) {
      console.error("Load Error:", error)
      toast.error("Failed to load audit logs")
      setAuditLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLogs = (auditLogs || []).filter(log =>
    (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.target_type || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.performed_by || "").toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages])

  const startIndex = (currentPage - 1) * itemsPerPage
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage)

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1)
  }

  const getActionStyle = (action) => {
    const upper = action?.toUpperCase() || "";
    if (upper.includes('BLOCK')) return 'badge-danger';
    if (upper.includes('UNBLOCK')) return 'badge-success';
    if (upper.includes('CREATE')) return 'badge-info';
    if (upper.includes('UPDATE')) return 'badge-warning';
    if (upper.includes('DELETE')) return 'badge-dark';
    return 'badge-default';
  }

  const getTargetIcon = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes('company') || t.includes('org')) return <FaBuilding />;
    if (t.includes('user') || t.includes('candidate')) return <FaUser />;
    if (t.includes('job')) return <FaBriefcase />;
    return <FaAlignLeft />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  return (
    <div className="audit-container">
      <div className="audit-controls">
        <div className="title-section">
          <h3>Audit Logs</h3>
          <p>Track system activities and security events</p>
        </div>
        <div className="controls-right">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="audit-card">
        <div className="audit-table-wrapper" ref={tableContainerRef}>
          
          <div className="table-header">
            <div className="col-action">Action</div>
            <div className="col-target">Target Entity</div>
            <div className="col-details">Description</div>
            <div className="col-time">Timestamp</div>
          </div>

          {isLoading ? (
            <div className="loading-state">Loading audit logs...</div>
          ) : currentLogs.length === 0 ? (
            <div className="empty-state">No logs found.</div>
          ) : (
            <div className="table-body">
              {currentLogs.map((log, index) => (
                <div className="table-row" key={log.audit_id || index}>
                  
                  <div className="col-action">
                    <div className="icon-box">
                      <FaHistory />
                    </div>
                    <span className={`status-badge ${getActionStyle(log.action)}`}>
                        {log.action?.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="col-target">
                    <div className="target-wrapper">
                        <div className="target-icon">
                           {getTargetIcon(log.target_type)}
                        </div>
                        <div className="target-text">
                           <span className="t-type">{log.target_type}</span>
                           <span className="t-id">ID: {log.target_id?.substring(0,8)}...</span>
                        </div>
                    </div>
                  </div>

                  <div className="col-details">
                    <div className="detail-wrapper">
                       <FaTag className="detail-icon" />
                       <span className="detail-text">
                          {log.payload_json?.reason || "System action logged"}
                       </span>
                    </div>
                  </div>

                  <div className="col-time">
                    <div className="time-wrapper">
                        <FaClock />
                        <span>{formatDate(log.created_at)}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pagination-wrapper">
          <span className="page-info">
            Showing {filteredLogs.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
          </span>
          <div className="page-btns">
            <button disabled={currentPage === 1} onClick={handlePrevPage}>
              <FaChevronLeft />
            </button>
            <button className="active-page" disabled>{currentPage}</button>
            <button disabled={currentPage >= totalPages || totalPages === 0} onClick={handleNextPage}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Audit