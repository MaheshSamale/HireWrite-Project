import { createContext, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { ToastContainer } from 'react-toastify'
import Home from './pages/Home.jsx'
import CandidateLogin from './pages/CandidateLogin.jsx'
import CandidateRegister from './pages/CandidateRegister.jsx'

export const UserContext = createContext()
function App() {
  const [user, setUser] = useState(null)
  return (
    <>
      <UserContext.Provider value={{ user, setUser }}>
        <Routes>
          <Route path='*' element={<Home />} />
          <Route path='/register' element={<CandidateRegister />} />

          <Route path='/home' element={user ? <Home /> : <Navigate to='/' />} >
             
          </Route>
          <Route path='/login' element={<CandidateLogin />} />

        </Routes>
      </UserContext.Provider>
      <ToastContainer />
    </>
  )
}

export default App