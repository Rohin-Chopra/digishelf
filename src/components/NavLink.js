import React from 'react'
import { NavLink as Link } from 'react-router-dom'

const MyNavLink = ({ to, pathname, children, className }) => {
  return (
    <Link
      to={to}
      className={`no-underline transition duration-200 ease-in-out ${className}`}
    >
      {children}
    </Link>
  )
}

export default MyNavLink
