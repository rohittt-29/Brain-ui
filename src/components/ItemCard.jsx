import React from 'react'
import { Button } from './ui/button';

const ItemCard = ({ item, onEdit, onDelete }) => {
  const { _id, title, type, tags = [], content, url, fileUrl } = item;

  // Extract filename from fileUrl
  const getFilename = (fileUrl) => {
    if (!fileUrl) return '';
    const parts = fileUrl.split('/');
    return parts[parts.length - 1] || '';
  };


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
      return fileUrl ? (
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-gray-600">{getFilename(fileUrl)}</span>
          <a
            href={toAbsolute(fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            View 
          </a>
        </div>
      ) : (
        <p className="text-sm text-red-500 mt-1">No file uploaded</p>
      );
    }
    
    
    return null
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg m-2 font-semibold text-gray-900">{title}</h3>
          {/* <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-red-700">{type}</span> */}
         <Button variant="outline">{type}</Button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(item)} className="text-xs px-3 py-1 rounded border hover:bg-gray-50">Edit</button>
          <Button onClick={() => onDelete(_id)} variant="destructive">Delete</Button>
        </div>
      </div>
      {renderBody()}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((t, i) => (
            <span key={i} className="btn btn-soft btn-info">{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemCard


