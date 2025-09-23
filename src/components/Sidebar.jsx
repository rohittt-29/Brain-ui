import React from 'react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Link, 
  Video, 
  StickyNote, 
  LogOut
} from 'lucide-react';

const Sidebar = ({ availableTypes = [], activeFilter, onFilterChange }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // Type labels mapping with icons
  const typeLabels = {
    'note': { label: 'Notes', icon: StickyNote },
    'link': { label: 'Links', icon: Link }, 
    'document': { label: 'Documents', icon: FileText },
    'video': { label: 'Videos', icon: Video }
  };

  const handleFilterClick = (type) => {
    if (onFilterChange) {
      onFilterChange(type);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-screen bg-slate-900 text-white scroll-smooth">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/60 sticky top-0 z-10 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
        <h1 className="text-xl font-semibold tracking-tight text-white">Brain <span className='text-green-600'>Box</span></h1>
      </div>

      {/* Navigation - Takes up available space */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1.5">
          {/* All Items */}
          <button
            onClick={() => handleFilterClick(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              !activeFilter 
                ? 'bg-green-600 text-white' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">All Items</span>
            <span className="ml-auto bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
              {availableTypes.reduce((sum, { count }) => sum + count, 0)}
            </span>
          </button>

          {/* Type Filters */}
          {availableTypes.map(({ type, count }) => {
            const IconComponent = typeLabels[type]?.icon || FileText;
            return (
              <button
                key={type}
                onClick={() => handleFilterClick(type)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  activeFilter === type 
                    ? 'bg-green-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{typeLabels[type]?.label || type}</span>
                <span className="ml-auto bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}

          {availableTypes.length === 0 && (
            <div className="px-4 py-3 text-slate-500 text-sm">
              No items yet
            </div>
          )}
        </nav>
      </div>

      {/* Logout Button - Pinned to bottom */}
      <div className="mt-auto p-4 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full">
      {sidebarContent}
    </div>
  )
}

export default Sidebar
