import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../utils/axios'

const SemanticSearch = ({ onSearchActiveChange, onResultsOrder }) => {
  const itemsList = useSelector((s) => s.items?.list || [])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keywordMatches, setKeywordMatches] = useState([])

  const hasQuery = useMemo(() => query.trim().length > 0, [query])

  useEffect(() => {
    // Notify parent to hide items grid while searching or showing results
    const active = hasQuery && (loading || (Array.isArray(results) && results.length > 0) || (Array.isArray(keywordMatches) && keywordMatches.length > 0))
    onSearchActiveChange?.(active)
  }, [hasQuery, loading, results, keywordMatches, onSearchActiveChange])

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.()
    if (!hasQuery) return
    setLoading(true)
    setError('')
    setResults([])
    setKeywordMatches([])
    try {
      const { data } = await api.post('/search', { query: query.trim() })
      // Expecting data.results as an array
      const items = Array.isArray(data?.results) ? data.results : []
      // Boost semantic scores with keyword hits in title/tags/url for better relevance
      const boosted = (Array.isArray(items) ? items : []).map((r) => {
        const base = Number(r?.similarity) || 0
        const q = query.trim().toLowerCase()
        const title = String(r?.title || '').toLowerCase()
        const url = String(r?.url || '').toLowerCase()
        const tags = Array.isArray(r?.tags) ? r.tags.map(t => String(t).toLowerCase()) : []
        let bonus = 0
        if (q && title.includes(q)) bonus += 0.5
        if (q && url.includes(q)) bonus += 0.2
        if (q && tags.some(t => t.includes(q))) bonus += 0.3
        const similarity = Math.max(0, Math.min(1, base + bonus))
        return { ...r, similarity }
      })
      const sorted = boosted.sort((a, b) => (Number(b?.similarity) || 0) - (Number(a?.similarity) || 0))
      setResults(sorted)
      onResultsOrder?.(sorted.map(r => r._id).filter(Boolean))

      // If semantic results are empty or very weak, fall back to keyword matching on local items
      const allWeak = sorted.length > 0 && sorted.every((r) => (Number(r?.similarity) || 0) < 0.2)
      if (sorted.length === 0 || allWeak) {
        const q = query.trim().toLowerCase()
        const kw = (itemsList || []).filter((it) => {
          const title = String(it?.title || '').toLowerCase()
          const content = String(it?.content || '').toLowerCase()
          const tags = Array.isArray(it?.tags) ? it.tags.map(t => String(t).toLowerCase()) : []
          return (
            title.includes(q) ||
            content.includes(q) ||
            tags.some(t => t.includes(q))
          )
        })
        setKeywordMatches(kw)
        onResultsOrder?.(kw.map(it => it._id).filter(Boolean))
      }
    } catch (err) {
      if (err?.isAuthMissing) {
        setError('Please login to use semantic search.')
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to fetch search results')
      }
    }
    setLoading(false)
  }, [hasQuery, query])

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
    if (s >= 0.7) return { text: 'Strong match', color: 'bg-green-100 text-green-700' }
    if (s >= 0.4) return { text: 'Related', color: 'bg-blue-100 text-blue-700' }
    if (s >= 0.2) return { text: 'Weakly related', color: 'bg-amber-100 text-amber-800' }
    return { text: 'Low match', color: 'bg-slate-100 text-slate-600' }
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


