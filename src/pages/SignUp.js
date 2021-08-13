import React, { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import isEmail from 'validator/lib/isEmail'
import isEmpty from 'validator/lib/isEmpty'
import ClipLoader from 'react-spinners/ClipLoader'
import { FaFacebookSquare as FacebookIcon } from 'react-icons/fa'
import Button from '../components/Button'
import Snackbar from '../components/Snackbar'
import AuthContext from '../context/AuthContext'
import { signUp } from '../utils/auth'
import GoogleIcon from './../images/google-icon.svg'
import bookshelfImg from './../images/bookshelf-with-person.png'
import { Auth } from 'aws-amplify'

const SignUp = ({ history }) => {
  const [inputs, setInputs] = useState({
    name: '',
    email: '',
    password: '',
    cPassword: ''
  })
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false,
    cPassword: false
  })

  const [isLoading, setIsLoading] = useState(false)

  const [snackbar, setSnackbar] = useState({
    show: false,
    color: '',
    message: ''
  })

  const [authContext, setAuthContext] = useContext(AuthContext)

  useEffect(() => {
    Auth.currentAuthenticatedUser().then((user) => {
      if (user) {
        history.push('/')
      }
    })
  }, [history])

  const validate = {
    name: (val) => !isEmpty(val),
    email: (val) => !isEmpty(val) && isEmail(val),
    password: (val) => !isEmpty(val) && val.length >= 8,
    cPassword: (val) => inputs.password === val
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const newErrors = {}
    Object.keys(errors).forEach((key) => {
      newErrors[key] = !validate[key](inputs[key])
    })
    setErrors(newErrors)

    let isFormValid = true

    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key]) {
        isFormValid = false
      }
    })

    if (isFormValid) {
      setIsLoading(true)
      const [user, err] = await signUp(inputs.email, inputs.password, {
        name: inputs.name,
        email: inputs.email
      })

      if (err) {
        console.log(err, 'hi')
        let message = ''
        switch (err.code) {
          case 'UsernameExistsException':
            message = 'Username already exists'
            break
          case 'UserLambdaValidationException':
            message = 'Email already exists'
            break
          default:
            message = 'Something went wrong'
        }
        setSnackbar({
          show: true,
          color: 'red-500',
          message
        })
      } else {
        console.log({ user })
        setAuthContext({ credentials: {}, user })
        setSnackbar({
          show: true,
          color: 'green-500',
          message: 'Success!'
        })
        history.push('/verify')
      }
      setIsLoading(false)
    }
    setIsLoading(false)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setInputs({
      ...inputs,
      [name]: value
    })
    setErrors({
      ...errors,
      [name]: !validate[name](value)
    })
  }
  return (
    <main className='flex'>
      <div className='md:grid md:grid-cols-3'>
        <div className='hidden md:block bg-pink-200 pt-4 px-4 col-span-1'>
          <img
            src={bookshelfImg}
            alt='Graphic of a guy with a bookshelf'
            className='transform -rotate-12 h-96'
          />
        </div>
        <div className='py-4 px-10 md:px-20 md:col-span-2 mx-auto'>
          <h1 className='prose prose-2xl font-bold'>Welcome to Digishelf</h1>
          <p className='prose text-gray-500'>
            Save your favorite content to Digishelf so you never forget your tv
            or a movie you watched
          </p>
          <form
            className='mt-4 flex flex-col justify-center'
            onSubmit={handleSubmit}
          >
            <div className='md:grid md:grid-cols-1 gap-4'>
              <div className='mb-4'>
                <label for='name' className='mb-1 block text-gray-500'>
                  Name
                </label>
                <input
                  type='text'
                  name='name'
                  value={inputs.name}
                  onChange={handleChange}
                  id='name'
                  className={`form-input px-3 rounded w-full shadow ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                <small
                  className={`text-red-500 ${errors.name ? '' : 'hidden'}`}
                >
                  Last Name cannot be empty
                </small>
              </div>
            </div>
            <div className='md:grid md:grid-cols-1'>
              <div className='mb-4'>
                <label for='email' className='mb-1 block text-gray-500'>
                  Email
                </label>
                <input
                  type='email'
                  name='email'
                  value={inputs.email}
                  onChange={handleChange}
                  id='email'
                  className={`form-input px-3 rounded w-full shadow ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                <small
                  className={`text-red-500 ${errors.email ? '' : 'hidden'}`}
                >
                  Invalid Email
                </small>
              </div>
            </div>

            <div className='md:grid md:grid-cols-2 gap-4'>
              <div className='mb-4'>
                <label for='password' className='mb-1 block text-gray-500'>
                  Password
                </label>
                <input
                  type='password'
                  name='password'
                  id='password'
                  value={inputs.password}
                  onChange={handleChange}
                  className={`form-input px-3 rounded w-full shadow ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
                <small
                  className={`text-red-500 ${errors.password ? '' : 'hidden'}`}
                >
                  Invalid password, password must be at 8 characters long
                </small>
              </div>
              <div className='mb-4'>
                <label for='cPassword' className='mb-1 block text-gray-500'>
                  Confirm password
                </label>
                <input
                  type='password'
                  name='cPassword'
                  id='cPassword'
                  value={inputs.cPassword}
                  onChange={handleChange}
                  className={`form-input px-3 rounded w-full shadow ${
                    errors.cPassword ? 'border-red-500' : ''
                  }`}
                />
                <small
                  className={`text-red-500 ${errors.cPassword ? '' : 'hidden'}`}
                >
                  Passwords do not match
                </small>
              </div>
            </div>

            <Button
              className='bg-secondary text-white disabled:opacity-50'
              disabled={isLoading}
            >
              Sign Up{' '}
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
            <p className='prose my-4 text-center text-gray-400'>
              Or Sign up with
            </p>
            <div className='flex justify-center'>
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
            <Link to='/login'>
              <p className='prose mt-4 text-center text-gray-400'>
                Already have an account? Log in now!
              </p>
            </Link>
          </form>
        </div>
      </div>
      <Snackbar
        color={snackbar.color}
        show={snackbar.show}
        setShow={() => {
          setSnackbar({ ...snackbar, show: false })
        }}
      >
        {snackbar.message}
      </Snackbar>
    </main>
  )
}

export default SignUp
