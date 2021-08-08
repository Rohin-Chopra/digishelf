import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import AuthContext from './context/AuthContext'
import { getCurrentUser } from './utils/auth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Logout from './pages/Logout'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import './App.css'

const App = () => {
  const [authContext, setAuthContext] = useState(null)

  useEffect(() => {
    getCurrentUser().then((res) => {
      setAuthContext(res)
    })
  }, [])

  return (
    <AuthContext.Provider value={[authContext, setAuthContext]}>
      <Router>
        <Navbar />
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/login' component={Login} />
          <Route path='/logout' component={Logout} />
        </Switch>
        <Footer />
      </Router>
    </AuthContext.Provider>
  )
}

export default App
