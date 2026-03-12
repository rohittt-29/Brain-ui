import React, { useCallback, useMemo, useState, useEffect } from 'react'
import api from '../utils/axios'

const SemanticSearch = ({ onSearchActiveChange, onResultsOrder, currentSection }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  // Cleanup effect when component unmounts or section changes
  useEffect(() => {
    return () => {
      onResultsOrder?.([])
      onSearchActiveChange?.(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection])

  const hasQuery = useMemo(() => query.trim().length > 0, [query])

  // Note: we explicitly toggle active state in submit/clear instead of an effect to avoid loops

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.()
    
    // Clear everything first
    setResults([])

    setError('')
    
    if (!hasQuery) {
      onResultsOrder?.([])
      onSearchActiveChange?.(false)
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    
    try {
      const { data } = await api.post('/search', { 
        query: query.trim(),
        section: currentSection
      });
      
      if (!data) {
        throw new Error('Invalid response format');
      }
      
      // Ensure we have an array of results
      const searchResults = Array.isArray(data.results) ? data.results : 
                          Array.isArray(data) ? data : [];
      
      // Results are already sorted by relevance from the backend
      setResults(searchResults)
      onResultsOrder?.(searchResults.map(r => r._id).filter(Boolean))
      onSearchActiveChange?.(searchResults.length > 0)

      // Show appropriate messages based on search type and results
      if (data.results.length === 0) {
        setError('No matches found for your search');
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err?.isAuthMissing) {
        setError('Please login to search.');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Search failed. Please try again.');
      }
    }
    setLoading(false)
  }, [hasQuery, query, currentSection, onResultsOrder, onSearchActiveChange])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }, [handleSubmit])



  // Reindex UI removed; endpoint remains available for maintenance

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search your items semantically..."
          className="flex-1 px-3 py-2 border bg-slate-50 dark:bg-slate-800 dark:text-white border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={!hasQuery || loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-green-700"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
        {hasQuery && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setError(''); onResultsOrder?.([]); onSearchActiveChange?.(false) }}
            className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Clear
          </button>
        )}
      </form>

      {/* Maintenance actions removed from UI */}

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md text-sm">{error}</div>
      )}

      {/* Results grid removed; parent renders ordered items */}
    </div>
  )
}

export default SemanticSearch


