import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const SemanticSearch = ({ onSearchActiveChange, onResultsOrder, currentSection }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { list } = useSelector((s) => s.items) || { list: [] }


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

  const handleSubmit = useCallback((e) => {
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
      const searchTerms = query.toLowerCase().trim().split(' ').filter(Boolean);
      
      let filtered = list || [];
      if (currentSection && currentSection !== 'All Items') {
        filtered = filtered.filter(i => (i.type || '').toLowerCase() === currentSection.toLowerCase());
      }
      
      const searchResults = filtered.filter(item => {
        const itemTags = (item.tags || []).map(t => t.toLowerCase());
        const itemTitle = (item.title || '').toLowerCase();
        const itemContent = (item.content || '').toLowerCase();
        
        return searchTerms.every(term => 
          itemTags.some(tag => tag.includes(term)) || 
          itemTitle.includes(term) || 
          itemContent.includes(term)
        );
      });
      
      setResults(searchResults)
      onResultsOrder?.(searchResults.map(r => r._id).filter(Boolean))
      onSearchActiveChange?.(searchResults.length > 0)

      if (searchResults.length === 0) {
        setError('No matches found for your search');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    }
    setLoading(false)
  }, [hasQuery, query, currentSection, onResultsOrder, onSearchActiveChange, list])

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


