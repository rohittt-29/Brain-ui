import React from 'react'
import './shimmer.css'

// Reusable Shimmer placeholder. Accepts width, height, borderRadius, and className.
const Shimmer = ({ width = '100%', height = '1rem', borderRadius = '6px', className = '' }) => {
  const style = {
    width,
    height,
    borderRadius,
  }

  return (
    <div className={`shimmer ${className}`} style={style} aria-hidden="true">
      <div className="shimmer__inner" />
    </div>
  )
}

export default Shimmer
