import React from 'react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Link, 
  Video, 
  StickyNote, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ availableTypes = [], activeFilter, onFilterChange }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  
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
    setIsOpen(false); // Close mobile menu after selection
  };

  const sidebarContent = (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-normal text-white">Brain <span className='text-green-600 font-normal'>Box</span></h1>
      </div>

      {/* Navigation - Takes up available space */}
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {/* All Items */}
          <button
            onClick={() => handleFilterClick(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              !activeFilter 
                ? 'bg-green-600 text-white shadow-lg' 
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeFilter === type 
                    ? 'bg-green-600 text-white shadow-lg' 
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
      <div className="mt-auto p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:inset-0
      `}>
        {sidebarContent}
      </div>
    </>
  )
}

export default Sidebar
