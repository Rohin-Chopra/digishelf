import React, { useState, useEffect } from 'react'
import Button from '../components/Button'
import ClipLoader from 'react-spinners/ClipLoader'
import { FaFacebookSquare as FacebookIcon } from 'react-icons/fa'
import { signIn } from '../utils/auth'
import GoogleIcon from './../images/google-icon.svg'
import bookshelfImg from './../images/bookshelf-with-person.png'
import { Auth } from 'aws-amplify'
import { Link } from 'react-router-dom'
import FormLabel from '../components/FormLabel'
import FormInput from '../components/FormInput'

const Login = ({ history }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Auth.currentAuthenticatedUser().then((user) => {
      if (user) {
        history.push('/')
      }
    })
  }, [history])

  const handleSubmit = async (e) => {
    setIsLoading(true)
    e.preventDefault()
    // eslint-disable-next-line
    const [_, error] = await signIn(email, password)

    if (error) {
      setError('Incorrect email or password')
      setIsLoading(false)
      return
    }
    setIsLoading(false)
    history.push('/shelves')
  }

  return (
    <main className='flex'>
      <div className='md:grid md:grid-cols-4 w-full pt-8 md:pt-0'>
        <div className='hidden md:block bg-pink-200 pt-4 px-4 col-span-1'>
          <img
            alt='a guy with a bookshelf'
            src={bookshelfImg}
            className='transform -rotate-12 h-96'
          />
        </div>

        <div className='py-4 px-10 md:px-20 md:col-span-3 md:flex md:justify-center md:items-center'>
          <div className='md:w-96'>
            `<h1 className='prose prose-xl font-bold'>Sign in to DigiShelf</h1>
            <small className='text-red-500 prose'>{error}</small>
            <form onSubmit={handleSubmit}>
              <div className='my-2'>
                <FormLabel for='firstName'>
                  Email
                </FormLabel>
                <FormInput
                  type='text'
                  name='email'
                  value={email}
                  onChange={({ target }) => setEmail(target.value)}
                  id='email'
                  isError={error}
                />
              </div>
              <div className='my-2'>
                <FormLabel for='firstName'>
                  Password
                </FormLabel>
                <FormInput
                  type='password'
                  name='password'
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                  id='password'
                  isError={error}
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
                <img alt='google' src={GoogleIcon} className='h-8' />
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
            <Link to='/sign-up'>
              <p className='prose mt-4 text-center text-gray-400'>
                Don't have an account ? Sign up now!
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login
