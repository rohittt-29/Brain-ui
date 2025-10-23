import React, { useCallback, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../utils/axios'

const SemanticSearch = ({ onSearchActiveChange, onResultsOrder, currentSection }) => {
  const itemsList = useSelector((s) => s.items?.list || [])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keywordMatches, setKeywordMatches] = useState([])

  const hasQuery = useMemo(() => query.trim().length > 0, [query])

  // Note: we explicitly toggle active state in submit/clear instead of an effect to avoid loops

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.()
    if (!hasQuery) {
      setResults([])
      setKeywordMatches([])
      onResultsOrder?.([])
      onSearchActiveChange?.(false)
      return
    }

    setLoading(true)
    setError('')
    setResults([])
    setKeywordMatches([])
    
    try {
      const { data } = await api.post('/search', { 
        query: query.trim(),
        section: currentSection
      });
      
      if (!data || !Array.isArray(data.results)) {
        throw new Error('Invalid response format');
      }
      
      // Results are already sorted by relevance from the backend
      setResults(data.results)
      onResultsOrder?.(data.results.map(r => r._id).filter(Boolean))
      onSearchActiveChange?.(data.results.length > 0)

      // Show appropriate messages based on search type and results
      if (data.results.length === 0) {
        setError('No matches found for your search');
      } else if (data.searchType === 'semantic') {
        // Optional: Inform user that semantic search was used
        console.log('Using semantic search results');
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

  const displayedResults = useMemo(() => {
    if (!Array.isArray(results)) return []
    return results
  }, [results])

  const getMatchLabel = (score) => {
    const s = Number(score) || 0
    if (s >= 0.8) return { text: 'Strong match', color: 'bg-green-100 text-green-700' }
    if (s >= 0.6) return { text: 'Good match', color: 'bg-blue-100 text-blue-700' }
    if (s >= 0.4) return { text: 'Related', color: 'bg-amber-100 text-amber-800' }
    if (s >= 0.2) return { text: 'Weakly related', color: 'bg-slate-100 text-slate-600' }
    return { text: 'Low match', color: 'bg-red-100 text-red-600' }
  }

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
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            onClick={() => { setQuery(''); setResults([]); setKeywordMatches([]); setError(''); onResultsOrder?.([]); onSearchActiveChange?.(false) }}
            className="px-3 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300"
          >
            Clear
          </button>
        )}
      </form>

      {/* Maintenance actions removed from UI */}

      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">{error}</div>
      )}

      {/* Results grid removed; parent renders ordered items */}
    </div>
  )
}

export default SemanticSearch


