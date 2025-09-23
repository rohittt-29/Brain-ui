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
      await dispatch(updateItem({ id: editing._id, data: payload })).unwrap()
      setEditing(null)
      toast.success('Item updated successfully')
    } catch (error) {
      toast.error('Failed to update item')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    // Show confirmation toast with action buttons
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

  // Filter items based on selected type
  const filteredItems = useMemo(() => {
    if (!filterType) return list || []
    return (list || []).filter(item => item.type === filterType)
  }, [list, filterType])

  // Get unique types from items for sidebar with counts
  const availableTypes = useMemo(() => {
    if (!Array.isArray(list)) return []
    const typeCounts = list.reduce((acc, item) => {
      if (item.type) {
        acc[item.type] = (acc[item.type] || 0) + 1
      }
      return acc
    }, {})
    
    return Object.keys(typeCounts).map(type => ({
      type,
      count: typeCounts[type]
    })).sort((a, b) => a.type.localeCompare(b.type))
  }, [list])

  const handleFilterChange = (type) => {
    setFilterType(type === filterType ? null : type) // Toggle filter
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
        <Sidebar 
          availableTypes={availableTypes}
          activeFilter={filterType}
          onFilterChange={handleFilterChange}
        />
      </div>

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
            <button 
              onClick={() => setShowCreate(true)} 
              className="px-3 py-2 cursor-pointer bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors shadow"
            >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>

            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pb-8">
          {/* Semantic Search */}
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

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {searchActive && Array.isArray(orderedIds) && orderedIds.length > 0
              ? orderedIds
                  .map(id => (list || []).find(it => it._id === id))
                  .filter(Boolean)
                  .map(item => (
                    <ItemCard key={item._id} item={item} onEdit={setEditing} onDelete={handleDelete} />
                  ))
              : Array.isArray(filteredItems) && filteredItems.map((item) => (
                  <ItemCard key={item._id} item={item} onEdit={setEditing} onDelete={handleDelete} />
                ))}
          </div>

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
            {/* <a href="https://rohitmalii.vercel.app" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 hover:text-green-600 transition-colors">
              Rohitmalii.vercel.app
            </a> */}
            <span>·</span>
            <span>The source code is available on</span>
            <a href="https://github.com/rohittt-29" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-green-600 transition-colors">
              GitHub
              
            </a>
          </div>
        </div>
      </div>

      {/* Modals */}
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


