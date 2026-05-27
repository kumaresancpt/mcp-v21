import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { VisitorTable } from '../components/VisitorTable'
import { FilterPanel } from '../components/FilterPanel'
import { useVisitors, Visitor } from '../hooks/useVisitors'

export function AllVisitors() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const { visitorList, loading, error, currentPage, pageSize, totalCount, onSearch, onFilter, onPageChange } = useVisitors()

  useEffect(() => {
    // Visitors are fetched automatically by the hook
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  const handleApplyFilters = (filters: any) => {
    onFilter(filters)
  }

  const handleRowClick = (visitor: Visitor) => {
    // Navigate to visitor detail page (to be implemented)
    console.log('View visitor:', visitor)
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar currentPage="all-visitors" />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-border-light px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">All Visitors</h1>
            <p className="text-sm text-text-secondary mt-1">List of all Visitors</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search Visitor, Passes"
                className="input-field w-80 pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">🔍</span>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilterPanel(true)}
              className="p-2 hover:bg-bg-primary rounded-lg transition-colors"
              title="Filter"
            >
              🔽
            </button>

            {/* Add Visitor Button */}
            <button
              onClick={() => navigate('/visitor-entry')}
              className="btn-primary px-6 py-2"
            >
              Add Visitor
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700">✕ {error}</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-card shadow-subtle overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-text-secondary">Loading visitors...</div>
            ) : visitorList.length > 0 ? (
              <>
                <VisitorTable data={visitorList} onRowClick={handleRowClick} />

                {/* Pagination Footer */}
                <div className="border-t border-border-light px-6 py-4 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Show {visitorList.length} of {totalCount} Records
                  </span>

                  <div className="flex items-center gap-2">
                    {pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'bg-border-light text-text-primary hover:bg-border-medium'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button className="px-3 py-1 rounded-lg text-sm font-medium bg-border-light text-text-primary hover:bg-border-medium transition-all">
                      →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-text-secondary">No visitors found</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-border-light px-8 py-4 text-center text-xs text-text-secondary font-poppins">
          © 2026 Changepond. All Rights Reserved.
        </footer>
      </main>

      {/* Filter Panel Modal */}
      {showFilterPanel && (
        <FilterPanel
          onApply={handleApplyFilters}
          onClose={() => setShowFilterPanel(false)}
        />
      )}
    </div>
  )
}
