import React, { useState, useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import BeatLoader from 'react-spinners/BeatLoader'
import { getCurrentUser } from '../utils/auth'

const ProtectedRoute = ({ component: Component, redirectUnauthorizedTo: RedirectUnauthorizedTo, ...rest }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      setIsLoading(false)
    }).catch(() => {
      setUser(null)
      setIsLoading(false)
    })
  }, [])

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) {
          return (
            <main className='flex flex-col items-center justify-center'>
              <BeatLoader />
              Loading
            </main>
          )
        } else {
          if (user !== null) {
            console.log('user is logged in')
            return <Component {...props} />
          } else {
            console.log('user is not logged in')
            return RedirectUnauthorizedTo ? <RedirectUnauthorizedTo /> : <Redirect
              to={{
                pathname: '/login',
                state: {
                  from: props.location
                }
              }}
            />
          }
        }
      }}
    />
  )
}

export default ProtectedRoute
