import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Maincontainer from './components/Maincontainer'
import Home from './components/Home'
import { Provider } from 'react-redux'
import appStore from './utils/appStore'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <>
    <Provider store={appStore}>
    <BrowserRouter basename='/'>
      <Routes>
      <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/maincontainer' element={<Maincontainer />} />
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
