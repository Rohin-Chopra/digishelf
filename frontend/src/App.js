import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import theme from './theme'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import './App.css'
import SignUp from './pages/SignUp'

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <>
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
          <Navbar setIsOpen={setIsOpen} />
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/sign-up' component={SignUp} />
          </Switch>
          <Footer />
        </>
      </Router>
    </ThemeProvider>
  )
}

export default App
