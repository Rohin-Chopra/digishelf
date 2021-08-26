import React from 'react'
import { NavLink } from 'react-router-dom'

const MyNavLink = ({ to, children, className, ...otherProps }) => {
  return (
    <NavLink
      to={to}
      exact
      activeClassName='opacity-100'
      className={`no-underline transition duration-200 ease-in-out opacity-80 ${className}`}
      {...otherProps}
    >
      {children}
    </NavLink>
  )
}

export default MyNavLink
