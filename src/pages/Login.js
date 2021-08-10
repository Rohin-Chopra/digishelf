import React, { useState, useContext, useEffect } from 'react'
import Button from '../components/Button'
import ClipLoader from 'react-spinners/ClipLoader'
import { FaFacebookSquare as FacebookIcon } from 'react-icons/fa'
import AuthContext from '../context/AuthContext'
import { signIn } from '../utils/auth'
import GoogleIcon from './../images/google-icon.svg'
import bookshelfImg from './../images/bookshelf-with-person.png'
import { Auth } from 'aws-amplify'

const Login = ({ history }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [authContext, setAuthContext] = useContext(AuthContext)

  useEffect(() => {
    Auth.currentAuthenticatedUser().then((user) => {
      if (user) {
        history.push('/')
      }
    })
  }, [history])

  const handleSubmit = async (event) => {
    setIsLoading(true)
    event.preventDefault()

    const [user, error] = await signIn(email, password)

    if (error) {
      setError('Incorrect email or password')
      setIsLoading(false)
      return
    }
    setIsLoading(false)
    setAuthContext(user)
    history.push('/shelves')
  }

  return (
    <main className='flex'>
      <div className='md:grid md:grid-cols-4 w-full pt-8 md:pt-0'>
        <div className='hidden md:block bg-pink-200 pt-4 px-4 col-span-1'>
          <img src={bookshelfImg} className='transform -rotate-12 h-96' />
        </div>

        <div className='py-4 px-10 md:px-20 md:col-span-3 md:flex md:justify-center md:items-center'>
          <div className='md:w-96'>
            `<h1 className='prose prose-xl font-bold'>Sign in to DigiShelf</h1>
            <small className='text-red-500 prose'>{error}</small>
            <form onSubmit={handleSubmit}>
              <div className='my-2'>
                <label for='firstName' className='mb-1 block text-gray-500'>
                  Email
                </label>
                <input
                  type='text'
                  name='email'
                  value={email}
                  onChange={({ target }) => setEmail(target.value)}
                  id='email'
                  className={`form-input px-3 rounded w-full shadow ${
                    error ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <div className='my-2'>
                <label for='firstName' className='mb-1 block text-gray-500'>
                  Password
                </label>
                <input
                  type='password'
                  name='password'
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                  id='password'
                  className={`form-input px-3 rounded w-full shadow ${
                    error ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <Button
                className='bg-secondary text-white disabled:opacity-50 mt-2 w-full md:w-auto md:px-10'
                disabled={isLoading}
              >
                Login{' '}
                <ClipLoader
                  height={20}
                  width={20}
                  css={`
                    ${!isLoading ? 'display:none;' : ''}vertical-align:middle;
                    height: 20px;
                    width: 20px;
                  `}
                />
              </Button>
            </form>
            <p className='prose my-4 text-center text-gray-400'>
              Or Login with
            </p>
            <div className='flex justify-evenly'>
              <Button
                className='px-6 mx-2'
                onClick={() => Auth.federatedSignIn({ provider: 'Google' })}
              >
                <img src={GoogleIcon} className='h-8' />
              </Button>
              <Button
                className='px-6 mx-2'
                onClick={() => Auth.federatedSignIn({ provider: 'Facebook' })}
              >
                <FacebookIcon
                  className='text-2xl'
                  style={{
                    fontSize: '2rem',
                    color: '#3b5998'
                  }}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login
