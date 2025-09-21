import React from 'react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ availableTypes = [], activeFilter, onFilterChange }) => {
  const navigate = useNavigate();
  
  const handleLogout = () =>{
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // Type labels mapping
  const typeLabels = {
    'note': 'Notes',
    'link': 'Links', 
    'document': 'Documents',
    'video': 'Videos'
  };

  const handleFilterClick = (type) => {
    if (onFilterChange) {
      onFilterChange(type);
    }
  };
  return (
    <div>
      <div className="drawer p-4">
  <input id="my-drawer" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content">
    {/* Page content here */}
    <label htmlFor="my-drawer" className="btn btn-primary drawer-button"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
</svg>
</label>
  </div>
  <div className="drawer-side">
    <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
    <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4  flex flex-col justify-between">
      {/* Sidebar content here */}
      <div>
        <li className="menu-title">
          <span>Filter by Type</span>
        </li>
        
        {/* Show All Items */}
        <li>
          <a 
            className={!activeFilter ? 'active' : ''}
            onClick={() => handleFilterClick(null)}
          >
            📋 All Items
          </a>
        </li>
        
        {/* Dynamic Type Filters */}
        {availableTypes.map(({ type, count }) => (
          <li key={type}>
            <a 
              className={activeFilter === type ? 'active' : ''}
              onClick={() => handleFilterClick(type)}
            >
              {type === 'note' && '📝'}
              {type === 'link' && '🔗'}
              {type === 'document' && '📄'}
              {type === 'video' && '🎥'}
              {' '}
              {typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="badge badge-sm badge-outline ml-2">{count}</span>
            </a>
          </li>
        ))}
        
        {availableTypes.length === 0 && (
          <li>
            <span className="text-gray-500 text-sm">No items yet</span>
          </li>
        )}
      </div>
    
    <div className='m-3 cursor-pointer ' >
    <Button variant={"destructive"} className={`cursor-pointer ` } onClick={handleLogout} ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
</svg>
Logout</Button>

  </div>
  </ul>
  </div>
</div>
    </div>
  )
}

export default Sidebar
