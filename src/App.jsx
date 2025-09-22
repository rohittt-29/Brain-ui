import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Maincontainer from './components/Maincontainer'
import Home from './components/Home'
import ProtectedRoute from './components/ProtectedRoute'
import { Provider, useDispatch } from 'react-redux'
import appStore from './utils/appStore'
import { Toaster } from 'react-hot-toast'
import { setUser } from '@/utils/UserSlice'

const App = () => {
  const InitAuth = () => {
    const dispatch = useDispatch()
    useEffect(() => {
      try {
        const token = localStorage.getItem('token')
        const userString = localStorage.getItem('user')
        if (token && userString) {
          const parsedUser = JSON.parse(userString)
          if (parsedUser) {
            dispatch(setUser(parsedUser))
          }
        }
      } catch (_) {
        // ignore malformed localStorage data
      }
    }, [dispatch])
    return null
  }
  return (
    <>
    <Provider store={appStore}>
    <InitAuth />
    <BrowserRouter basename='/'>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path='/maincontainer' element={
          <ProtectedRoute>
            <Maincontainer />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#4ade80',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
    </Provider>
    </>
    
  )
}

export default App
