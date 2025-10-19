import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createItem, deleteItem, fetchItems, updateItem } from '../utils/itemsSlice'
import ItemCard from './ItemCard'
import ItemForm from './ItemForm'
import Sidebar from './Sidebar'
import toast from 'react-hot-toast'
import SemanticSearch from './SemanticSearch'

const MainContainer = () => {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector((s) => s.items)
  const user = useSelector((s) => s.user)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState(null) // null means show all
  const [orderedIds, setOrderedIds] = useState([])
  const [searchActive, setSearchActive] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [openGroups, setOpenGroups] = useState({})
  const [subFilter, setSubFilter] = useState(null) // e.g., domain for links or ext for docs

  useEffect(() => {
    dispatch(fetchItems())
  }, [dispatch])

  const handleCreate = async (payload) => {
    setSubmitting(true)
    try {
      await dispatch(createItem(payload)).unwrap()
      setShowCreate(false)
      toast.success('Item created successfully')
    } catch (error) {
      toast.error('Failed to create item')
    }
    setSubmitting(false)
  }

  const handleUpdate = async (payload) => {
    if (!editing) return
    setSubmitting(true)
    try {
      // If payload is FormData and no file is attached, convert to plain object
      let dataToSend = payload
      try {
        if (typeof FormData !== 'undefined' && payload instanceof FormData) {
          const maybeFile = payload.get && payload.get('pdf')
          if (!maybeFile) {
            // convert entries to simple object to send JSON instead of multipart
            const obj = {}
            for (const [k, v] of payload.entries()) obj[k] = v
            dataToSend = obj
          }
        }
      } catch (e) {
        // If FormData check fails, proceed with original payload
        console.debug('FormData conversion skipped', e)
      }

      console.debug('Updating item', editing._id, 'payload keys:', typeof dataToSend === 'object' ? Object.keys(dataToSend) : typeof dataToSend)
      await dispatch(updateItem({ id: editing._id, data: dataToSend })).unwrap()
      // Ensure UI reflects latest data from server
      await dispatch(fetchItems())
      setEditing(null)
      toast.success('Item updated successfully')
    } catch (error) {
      toast.error('Failed to update item')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Are you sure you want to delete this item?</span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await dispatch(deleteItem(id)).unwrap()
                toast.success('Item deleted successfully')
              } catch (error) {
                toast.error('Failed to delete item')
              }
            }}
          >
            Delete
          </button>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      style: {
        background: '#1f2937',
        color: '#fff',
        border: '1px solid #374151',
      },
    })
  }

  const filteredItems = useMemo(() => {
    const deriveDomain = (u) => {
      try {
        const urlObj = new URL(String(u || ''))
        return (urlObj.hostname || '').replace(/^www\./, '').toLowerCase()
      } catch { return '' }
    }
    const deriveExt = (it) => {
      const src = String(it?.fileUrl || it?.title || '').toLowerCase()
      const m = src.match(/\.([a-z0-9]+)(?:$|\?)/i)
      return m ? m[1] : ''
    }
    let base = list || []
    if (filterType) base = base.filter(item => item.type === filterType)
    if (filterType === 'link' && subFilter) {
      base = base.filter(it => {
        const sub = String(it?.categorySub || '').trim() || deriveDomain(it?.url)
        return sub === subFilter
      })
    }
    if (filterType === 'document' && subFilter) {
      base = base.filter(it => {
        const sub = String(it?.categorySub || '').trim() || deriveExt(it)
        return sub === subFilter
      })
    }
    return base
  }, [list, filterType, subFilter])

  // Grouped by subcategory for the currently filtered list (used in Links/Docs tabs)
  const groupedBySub = useMemo(() => {
    const groups = {}
    const pool = Array.isArray(filteredItems) ? filteredItems : []
    pool.forEach((it) => {
      const key = String(it?.categorySub || '').trim() || (it.type === 'document' ? 'file' : 'external')
      if (!groups[key]) groups[key] = []
      groups[key].push(it)
    })
    return groups
  }, [filteredItems])

  const availableTypes = useMemo(() => {
    // preserve existing sidebar counts per type
    if (!Array.isArray(list)) return []
    const typeCounts = list.reduce((acc, item) => {
      if (item.type) {
        acc[item.type] = (acc[item.type] || 0) + 1
      }
      return acc
    }, {})
    return Object.keys(typeCounts).map(type => ({ type, count: typeCounts[type] }))
  }, [list])

  const handleFilterChange = (type) => {
    const next = type === filterType ? null : type
    setFilterType(next)
    // reset subFilter when changing/toggling top-level filter
    setSubFilter(null)
    setCurrentPage(1)
  }

  const handleSubFilterChange = (type, key) => {
    setFilterType(type)
    setSubFilter(key || null)
    setCurrentPage(1)
  }

  // Build sub-groups (domains/extensions) for Sidebar nesting
  const subGroups = useMemo(() => {
    const domains = new Set()
    const exts = new Set()
    const deriveDomain = (u) => {
      try {
        const urlObj = new URL(String(u || ''))
        return (urlObj.hostname || '').replace(/^www\./, '').toLowerCase()
      } catch { return '' }
    }
    const deriveExt = (it) => {
      const src = String(it?.fileUrl || it?.title || '').toLowerCase()
      const m = src.match(/\.([a-z0-9]+)(?:$|\?)/i)
      return m ? m[1] : ''
    }
    ;(list || []).forEach((it) => {
      if (it.type === 'link') {
        const key = String(it?.categorySub || '').trim() || deriveDomain(it?.url)
        if (key) domains.add(key)
      }
      if (it.type === 'document') {
        const key = String(it?.categorySub || '').trim() || deriveExt(it)
        if (key) exts.add(key)
      }
    })
    return {
      link: Array.from(domains).sort((a,b)=>a.localeCompare(b)),
      document: Array.from(exts).sort((a,b)=>a.localeCompare(b)),
    }
  }, [list])

  // Compute items to show: search-ordered or filtered
  const itemsToDisplay = useMemo(() => {
    if (searchActive && Array.isArray(orderedIds) && orderedIds.length > 0) {
      return orderedIds
        .map(id => (list || []).find(it => it._id === id))
        .filter(Boolean)
    }
    return Array.isArray(filteredItems) ? filteredItems : []
  }, [searchActive, orderedIds, list, filteredItems])

  // Reset to first page when dataset changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchActive, orderedIds, filterType])

  const totalItems = itemsToDisplay.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const pagedItems = itemsToDisplay.slice(pageStart, pageEnd)

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar (desktop only) */}
      <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0">
        <Sidebar 
          availableTypes={availableTypes}
          activeFilter={filterType}
          onFilterChange={handleFilterChange}
          onSubFilterChange={handleSubFilterChange}
          subGroups={subGroups}
          activeSubFilter={subFilter}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {filterType ? filterType.charAt(0).toUpperCase() + filterType.slice(1) : 'All Items'}
              </h1>
              <p className="text-slate-600 mt-0.5 text-sm">
                👋 Hi {user?.username || 'User'}! Here's what you have today.
                {filterType && (
                  <button 
                    onClick={() => setFilterType(null)}
                    className="ml-2 text-green-600 hover:text-green-700 font-medium text-xs"
                  >
                    (Clear filter)
                  </button>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile: sidebar toggle */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                aria-label="Open sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              </button>
              {/* Desktop: create button */}
              <button 
                onClick={() => setShowCreate(true)} 
                className="hidden lg:inline-flex px-3 py-2 cursor-pointer bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pb-8">
          <SemanticSearch onSearchActiveChange={(active) => {
            setSearchActive(active)
            if (!active) setOrderedIds([])
          }} onResultsOrder={(ids) => {
            setOrderedIds(ids || [])
          }} />

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-600">Loading…</div>
            </div>
          )}

          {/* Top pagination controls */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Showing {Math.min(totalItems, pageStart + 1)}–{Math.min(totalItems, pageEnd)} of {totalItems}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600">Per page</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
              </select>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-600 px-1">{currentPage}/{totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Flat grid; reacts to Sidebar filters only */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {pagedItems.map((item) => (
              <ItemCard key={item._id} item={item} onEdit={setEditing} onDelete={handleDelete} />
            ))}
          </div>

          {/* Bottom pagination controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded bg-white disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {(!loading && Array.isArray(filteredItems) && filteredItems.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {filterType ? `No ${filterType} items found` : 'No items yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {filterType ? `Try creating a new ${filterType} item.` : 'Create your first item to get started.'}
              </p>
              <button 
                onClick={() => setShowCreate(true)} 
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                + Create New Item
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-4 py-2">
          <div className="flex items-center justify-center text-xs text-slate-500 gap-1.5 flex-wrap">
            Built by  <a href="https://rohitmalii.vercel.app" target="_blank" rel="noopener noreferrer"><span className="font-medium text-slate-700 hover:text-green-600 transition-colors">This Guy</span></a>
            <span>·</span>
            <span>The source code is available on</span>
            <a href="https://github.com/rohittt-29" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-green-600 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer (left side, slide-in) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%]">
            <div className="h-full bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out translate-x-0 will-change-transform scroll-smooth scroll-touch">
              <Sidebar 
                availableTypes={availableTypes}
                activeFilter={filterType}
                onFilterChange={(type) => { setFilterType(type === filterType ? null : type); setMobileSidebarOpen(false) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Create Button */}
      <button
        onClick={() => setShowCreate(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-600 text-white shadow-xl flex items-center justify-center hover:bg-green-700"
        aria-label="Create item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Create New Item</h2>
            <ItemForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} submitting={submitting} />
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Edit Item</h2>
            <ItemForm mode="edit" initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitting={submitting} />
          </div>
        </div>
      )}
    </div>
  )
}

export default MainContainer
