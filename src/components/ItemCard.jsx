import React from 'react'
import { Button } from './ui/button';
import { useSelector } from 'react-redux';
import LinkPreview from './LinkPreview';
import { 
  Edit3, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Link as LinkIcon, 
  Video, 
  StickyNote,
  Calendar,
  MoreHorizontal
} from 'lucide-react';

const ItemCard = ({ item, onEdit, onDelete }) => {
  const { _id, title, type, tags = [], content, url, fileUrl } = item;
  const user = useSelector((s) => s.user);

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

  // Type configuration with icons and colors
  const typeConfig = {
    'note': { 
      icon: StickyNote, 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Note'
    },
    'link': { 
      icon: LinkIcon, 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Link'
    },
    'document': { 
      icon: FileText, 
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Document'
    },
    'video': { 
      icon: Video, 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      label: 'Video'
    }
  };

  const currentType = typeConfig[type] || typeConfig['note'];
  const IconComponent = currentType.icon;

  const renderBody = () => {
    if (type === 'note') {
      const preview = (content || '').slice(0, 100)
      return (
        <div className="mt-2 flex-1">
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
            {preview}{(content || '').length > 100 ? '…' : ''}
          </p>
        </div>
      )
    }
    if (type === 'link' || type === 'video') {
      return (
        <div className="mt-2 flex-1">
          <LinkPreview url={toAbsolute(url)} type={type} />
        </div>
      )
    }
    if (type === 'document') {
      return fileUrl ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-slate-600 truncate flex-1 mr-2">{getFilename(fileUrl)}</span>
          <a
            href={toAbsolute(fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            View
          </a>
        </div>
      ) : (
        <p className="text-sm text-red-500 mt-2">No file uploaded</p>
      );
    }
    
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group h-full flex flex-col">
      {/* Card Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-2 line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${currentType.color}`}>
                <IconComponent className="w-3 h-3" />
                {currentType.label}
              </span>
            </div>
          </div>
          
          {/* Action Menu */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(item)} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(_id)} 
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col">
        {renderBody()}
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 3).map((tag, i) => (
              <span 
                key={i} 
                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md border border-slate-200">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        {/* Metadata Section */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-3">
            <span>Created by {user?.username || 'User'}</span>
            <span>•</span>
            <span>{item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</span>
          </div>
          <div className="text-xs">
            {type === 'document' ? (
              fileUrl ? (
                <span className="text-green-600 font-medium">View</span>
              ) : (
                <span className="text-red-500">No file uploaded</span>
              )
            ) : (
              <span className="text-slate-400">Ready</span>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ItemCard


