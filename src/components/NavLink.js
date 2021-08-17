import React from 'react'
import { NavLink as Link } from 'react-router-dom'

const MyNavLink = ({ to, children, className, ...otherProps }) => {
  return (
    <Link
      to={to}
      activeClassName='opacity-100'
      className={`no-underline transition duration-200 ease-in-out opacity-80 ${className}`}
      {...otherProps}
    >
      {children}
    </Link>
  )
}

export default MyNavLink
