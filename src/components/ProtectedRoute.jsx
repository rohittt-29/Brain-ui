import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user)
  const token = localStorage.getItem('token')

  // Check if user is authenticated (has user data and token)
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }

  // Render the protected component if authenticated
  return children
}

export default ProtectedRoute
