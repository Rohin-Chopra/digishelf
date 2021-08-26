import React, { useContext } from 'react'
import { Redirect } from 'react-router-dom'
import AuthContext from './../context/AuthContext'
import { getCurrentUser, signOut } from '../utils/auth'

const Logout = () => {
  const user = getCurrentUser()
  // eslint-disable-next-line
  const [_, setAuthContext] = useContext(AuthContext)
  if (user !== null && signOut()) {
    setAuthContext(null)
  }

  return (
    <div>
      <Redirect to='/' />
    </div>
  )
}

export default Logout
