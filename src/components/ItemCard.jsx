import React from 'react'

const ItemCard = ({ item, onEdit, onDelete }) => {
  const { _id, title, type, tags = [], content, url, filePath } = item

  const toAbsolute = (value) => {
    if (!value) return '#'
    if (/^https?:\/\//i.test(value)) return value
    const apiBase = import.meta.env.VITE_API_URL || ''
    if (apiBase) {
      const base = apiBase.replace(/\/$/, '')
      const path = String(value).replace(/^\//, '')
      return `${base}/${path}`
    }
    return value
  }

  const renderBody = () => {
    if (type === 'note') {
      const preview = (content || '').slice(0, 120)
      return <p className="text-sm text-gray-600 mt-1">{preview}{(content || '').length > 120 ? '…' : ''}</p>
    }
    if (type === 'link' || type === 'video') {
      return (
        <a href={toAbsolute(url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all mt-1 inline-block">
          {url}
        </a>
      )
    }
    if (type === 'document') {
      return (
        <a href={toAbsolute(filePath)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all mt-1 inline-block">
          {filePath}
        </a>
      )
    }
    return null
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{type}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(item)} className="text-xs px-3 py-1 rounded border hover:bg-gray-50">Edit</button>
          <button onClick={() => onDelete(_id)} className="text-xs px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>
      {renderBody()}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((t, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemCard


