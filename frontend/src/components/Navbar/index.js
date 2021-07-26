import React, { Fragment } from 'react'
import { NavLink as Link } from 'react-router-dom'

import { Logo, Nav, NavLink, Bars, NavMenu, NavBtn } from './NavbarElements'
import logo from './../../images/logo.png'

const Navbar = ({ setIsOpen = () => {} }) => {
  return (
    <>
      <Nav>
        <NavLink to='/'>
          <Logo src={logo} />
        </NavLink>
        <Bars onClick={() => setIsOpen(true)} />
        <NavMenu>
          <NavLink to='/login'>Login</NavLink>
          <Link to='/sign-up'>
            <NavBtn>Sign Up</NavBtn>
          </Link>
        </NavMenu>
      </Nav>
    </>
  )
}

export default Navbar
