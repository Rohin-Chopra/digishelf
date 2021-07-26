import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import theme from './theme'
import HomeScreen from './screens/HomeScreen'
import ShelfScreen from './screens/ShelfScreen'
import ShelvesScreen from './screens/ShelvesScreen'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

import './App.css'

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <>
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
          <Navbar setIsOpen={setIsOpen} />
          <Switch>
            <Route path='/' exact component={HomeScreen} />
            <Route path='/sign-up' component={ShelfScreen} />
            <Route path='/login' component={ShelvesScreen} />
          </Switch>
        </>
      </Router>
    </ThemeProvider>
  )
}

export default App
