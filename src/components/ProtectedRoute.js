import React, { useState, useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import BeatLoader from 'react-spinners/BeatLoader'
import { getCurrentUser } from '../utils/auth'

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
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
            return <Component {...props} />
          } else {
            return (
              <Redirect
                to={{
                  pathname: '/login',
                  state: {
                    from: props.location
                  }
                }}
              />
            )
          }
        }
      }}
    />
  )
}

export default ProtectedRoute
