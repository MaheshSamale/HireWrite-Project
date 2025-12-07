import { createContext, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { ToastContainer } from 'react-toastify'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'

import './App.css'

export const UserContext = createContext()
function App() {
  const [user, setUser] = useState(null)
  return (
    <>
      <UserContext.Provider value={{ user, setUser }}>
        <Routes>
          <Route path='*' element={<Login />} />
          <Route path='/register' element={<Register />} />

          <Route path='/home' element={user ? <Home /> : <Navigate to='/' />} >
             {/* <Route path='allblogs' element={<AllBlogs />} />
            <Route path='addblogs' element={<AddBlog />} />
            <Route path='addcategory' element={<AddCategory />} />
            <Route path='myblogs' element={<MyBlogs />} /> */}
          </Route>

        </Routes>
      </UserContext.Provider>
      <ToastContainer />
    </>
  )
}

export default App