import React, { Fragment } from 'react'
import { NavLink as Link } from 'react-router-dom'

import {
  Nav,
  NavLink,
  Bars,
  NavMenu,
  NavBtn,
  NavBtnLink
} from './NavbarElements'

const Navbar = ({ setIsOpen }) => {
  return (
    <>
      <Nav>
        <NavLink to='/'>
          <h1>DigiShelf</h1>
        </NavLink>
        <Bars onClick={() => setIsOpen(true)} />
        <NavMenu>
          <NavLink to='/about'>Login</NavLink>
          <Link to='/services'>
            <NavBtn>Sign Up</NavBtn>
          </Link>
        </NavMenu>
      </Nav>
    </>
  )
}

export default Navbar
