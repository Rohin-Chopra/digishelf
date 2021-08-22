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
import AddShelf from './pages/AddShelf'
import GetMyShelves from './pages/GetMyShelves'
import GetShelf from './pages/GetShelf'
import AddMediaToShelf from './pages/AddMediaToShelf'
import Discover from './pages/Discover'


const App = () => {
  const [authContext, setAuthContext] = useState(null)

  useEffect(() => {
    getCurrentUser().then((res) => {
      setAuthContext(res)
    })
  }, [])
  console.log('hola')

  return (
    <AuthContext.Provider value={[authContext, setAuthContext]}>
      <Router>
        <Navbar />
        <Switch>
          <ProtectedRoute path='/' exact component={GetMyShelves} redirectUnauthorizedTo={Home} />
          <Route path='/login' component={Login} />
          <Route path='/logout' component={Logout} />
          <Route path='/sign-up' component={SignUp} />
          <Route path='/verify' component={VerifyUser} />
          <ProtectedRoute path='/discover' exact component={Discover} />
          <ProtectedRoute path='/add' exact component={AddShelf} />
          <ProtectedRoute path='/:id' exact component={GetShelf} />
          <ProtectedRoute
            path='/:id/media/add'
            exact
            component={AddMediaToShelf}
          />
        </Switch>
        <Footer />
      </Router>
    </AuthContext.Provider>
  )
}
export default App
