import React, { useEffect, useState } from 'react'
import { getAllCandidates } from '../services/admin'
import './candidate.css'
import { FaUserCircle } from 'react-icons/fa'

const Candidate = () => {
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const ITEMS_PER_PAGE = 6

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    const result = await getAllCandidates()
    if (result.status === 'success') {
      setCandidates(result.data)
    }
  }

  /* ================= SEARCH ================= */
  const filteredCandidates = candidates.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.email?.toLowerCase().includes(search.toLowerCase()) ||
    item.mobile?.includes(search)
  )

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE)
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const currentCandidates = filteredCandidates.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const handleBlock = (id) => {
    console.log('Block candidate:', id)
    // API call later
  }

  return (
    <div className="candidate-container">
      <h2 className="page-title">Candidates</h2>

      {/* ================= SEARCH BAR ================= */}
      <input
        className="candidate-search"
        type="text"
        placeholder="Search candidates by name, email or mobile..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
      />

      {/* ================= LIST ================= */}
      <div className="candidate-card">
        {currentCandidates.map(item => (
          <div className="candidate-row" key={item.user_id}>
            <div className="candidate-left">
              <div className="candidate-avatar">
                {item.profile_photo_url ? (
                  <img src={item.profile_photo_url} alt={item.name} />
                ) : (
                  <FaUserCircle className="user-icon" />
                )}
              </div>

              <div className="candidate-info">
                <p className="candidate-name">{item.name}</p>
                <p className="candidate-mobile">{item.mobile}</p>
                <p className="candidate-email">{item.email}</p>
              </div>
            </div>

            <div className="candidate-right">
              <button
                className="block-btn"
                onClick={() => handleBlock(item.user_id)}
              >
                Block
              </button>
            </div>
          </div>
        ))}

        {filteredCandidates.length === 0 && (
          <p className="empty-text">No candidates found</p>
        )}

        {/* ================= PREV / NEXT ================= */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Candidate
