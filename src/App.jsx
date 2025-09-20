import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Maincontainer from './components/Maincontainer'

import Home from './components/Home'
import { Provider } from 'react-redux'
import appStore from './utils/appStore'

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
    </Provider>
    </>
    
  )
}

export default App
