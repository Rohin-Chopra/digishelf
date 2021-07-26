import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import theme from './theme'
import HomeScreen from './screens/HomeScreen'
import ShelfScreen from './screens/ShelfScreen'
import ShelvesScreen from './screens/ShelvesScreen'
import Navbar from './components/Navbar'

import './App.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <>
          <Navbar />
          <Switch>
            <Route path='/' exact component={HomeScreen} />
            <Route path='/about' component={ShelfScreen} />
            <Route path='/services' component={ShelvesScreen} />
          </Switch>
        </>
      </Router>
    </ThemeProvider>
  )
}

export default App
