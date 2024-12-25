import React from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import Home from './pages/home'
import Login from './pages/login'
import Signup from './pages/signup'
import Loader from './components/loader'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/protectedRoute'
import {useSelector} from "react-redux"
import Profile from './pages/profile'
import NotFound from './pages/NotFound/NotFound'


const App = () => {
 const {loader}=useSelector(state=> state.loaderReducer);
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      {loader && <Loader />}
      <BrowserRouter>
        <Routes>
           <Route path="/" element={
                              <ProtectedRoute>
                                  <Home />
                              </ProtectedRoute>} />

           <Route path="/profile" element={
                              <ProtectedRoute>
                                  <Profile />
                              </ProtectedRoute>} />
           <Route path="/login" element={<Login/>} />
           <Route path="/signup" element={<Signup/>} />
           <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
    
  )
}

export default App
