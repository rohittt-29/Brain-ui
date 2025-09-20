import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createItem, deleteItem, fetchItems, updateItem } from '../utils/itemsSlice'
import ItemCard from './ItemCard'
import ItemForm from './ItemForm'
import Sidebar from './Sidebar'

const MainContainer = () => {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector((s) => s.items)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchItems())
  }, [dispatch])

  const handleCreate = async (payload) => {
    setSubmitting(true)
    try {
      await dispatch(createItem(payload)).unwrap()
      setShowCreate(false)
    } catch (_) {}
    setSubmitting(false)
  }

  const handleUpdate = async (payload) => {
    if (!editing) return
    setSubmitting(true)
    try {
      await dispatch(updateItem({ id: editing._id, data: payload })).unwrap()
      setEditing(null)
    } catch (_) {}
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this item?')
    if (!ok) return
    try {
      await dispatch(deleteItem(id)).unwrap()
    } catch (_) {}
  }

  return (
    <>
      <div>
          <Sidebar />
         </div>
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your Items</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 text-sm rounded bg-black text-white">New Item</button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">{error}</div>
      )}

      {loading && (
        <div className="mt-4 text-sm text-gray-600">Loading…</div>
      )}

      <div className="mt-4 grid gap-3">
        {Array.isArray(list) && list.map((item) => (
          <ItemCard key={item._id} item={item} onEdit={setEditing} onDelete={handleDelete} />
        ))}
        {(!loading && Array.isArray(list) && list.length === 0) && (
          <div className="text-sm text-gray-600">No items yet. Create your first one.</div>
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


