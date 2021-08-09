import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import AuthContext from './context/AuthContext'
import { getCurrentUser } from './utils/auth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Logout from './pages/Logout'
import SignUp from './pages/SignUp'
import VerifyUser from './pages/VerifyUser'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import './App.css'

const history = createBrowserHistory()
const App = () => {
  const [authContext, setAuthContext] = useState(null)

  useEffect(() => {
    getCurrentUser().then((res) => {
      setAuthContext(res)
    })
  }, [])

  return (
    <AuthContext.Provider value={[authContext, setAuthContext]}>
      <Router history={history}>
        <Navbar />
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/login' component={Login} />
          <Route path='/logout' component={Logout} />
          <Route path='/sign-up' component={SignUp} />
          <Route path='/verify' component={VerifyUser} />
        </Switch>
        <Footer />
      </Router>
    </AuthContext.Provider>
  )
}
export default App
