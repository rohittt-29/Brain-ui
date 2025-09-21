import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createItem, deleteItem, fetchItems, updateItem } from '../utils/itemsSlice'
import ItemCard from './ItemCard'
import ItemForm from './ItemForm'
import Sidebar from './Sidebar'
import toast from 'react-hot-toast'

const MainContainer = () => {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector((s) => s.items)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState(null) // null means show all

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
    <>
      <div>
          <Sidebar 
            availableTypes={availableTypes}
            activeFilter={filterType}
            onFilterChange={handleFilterChange}
          />
         </div>
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your Items</h1>
          {filterType && (
            <p className="text-sm text-gray-600 mt-1">
              Showing: {filterType.charAt(0).toUpperCase() + filterType.slice(1)} items
              <button 
                onClick={() => setFilterType(null)}
                className="ml-2 text-blue-600 hover:underline"
              >
                (Clear filter)
              </button>
            </p>
          )}
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 text-sm rounded bg-black text-white">New Item</button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">{error}</div>
      )}

      {loading && (
        <div className="mt-4 text-sm text-gray-600">Loading…</div>
      )}

      <div className="mt-4 grid gap-3">
        {Array.isArray(filteredItems) && filteredItems.map((item) => (
          <ItemCard key={item._id} item={item} onEdit={setEditing} onDelete={handleDelete} />
        ))}
        {(!loading && Array.isArray(filteredItems) && filteredItems.length === 0) && (
          <div className="text-sm text-gray-600">
            {filterType ? `No ${filterType} items found.` : 'No items yet. Create your first one.'}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-5">
            <h2 className="text-lg font-semibold mb-3">Create Item</h2>
            <ItemForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} submitting={submitting} />
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-5">
            <h2 className="text-lg font-semibold mb-3">Edit Item</h2>
            <ItemForm mode="edit" initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitting={submitting} />
          </div>
          </div>
        )}
         </div>
       
      </>
   
  )
}

export default MainContainer


