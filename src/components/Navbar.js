import React, { useState, useContext, useEffect } from 'react'
import { NavLink as Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'

import logo from './../images/logo.png'
import Button from './Button'
import AuthContext from '../context/AuthContext'

const Navbar = () => {
  const [authContext] = useContext(AuthContext)
  const loggedIn = authContext !== null
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    console.log(11)
  }

  return (
    <>
      <nav className='h-50 bg-primary'>
        <div className='container mx-auto flex justify-between py-4 px-10'>
          <Link
            to='/'
            className='text-white no-underline mr-4 transition duration-200 ease-in-out'
          >
            <img src={logo} className='h-20' alt='Digishelf logo' />
          </Link>
          <FaBars
            className='block text-2xl absolute top-4 right-0 cursor-pointer text-white md:hidden'
            style={{ transform: 'translate(-100%, 75%)' }}
            onClick={() => setIsOpen(true)}
          />

          <div className='hidden md:flex md:items-center md:justify-center'>
            {loggedIn ? (
              <>
                <Link
                  to='/shelves'
                  className='text-white no-underline mr-4 transition duration-200 ease-in-out'
                >
                  My Shelves
                </Link>
                <Link
                  to='/logout'
                  className='text-white no-underline mr-4 transition duration-200 ease-in-out'
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                {' '}
                <Link
                  to='/login'
                  loggedIn
                  className='text-white no-underline mr-4 transition duration-200 ease-in-out'
                >
                  Login
                </Link>
                <Link to='sign-up'>
                  <Button className='bg-secondary text-white'>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
          <div
            className={`transition-all fixed z-50 w-full h-full ${
              isOpen ? 'flex' : 'hidden'
            } items-center justify-center top-0 left-0 delay-300 ease-in-out
            }`}
            style={{ background: '#0d0d0d' }}
          >
            <div className='absolute top-5 right-6 bg-transparent text-4xl cursor-pointer outline-none'>
              <FaTimes
                className='text-white'
                onClick={() => setIsOpen(false)}
              />
            </div>
            <div className='text-white'>
              <div className='grid grid-cols-1 grid-rows-6 text-center text-2xl'>
                {loggedIn ? (
                  <>
                    <Link
                      to='/shelves'
                      className='text-white no-underline my-2 transition duration-200 ease-in-out'
                      onClick={() => setIsOpen(false)}
                    >
                      My Shelves
                    </Link>
                    <Link
                      to='/logout'
                      className='text-white no-underline my-2 transition duration-200 ease-in-out'
                      onClick={() => setIsOpen(false)}
                    >
                      Logout
                    </Link>
                  </>
                ) : (
                  <>
                    {' '}
                    <Link
                      to='/login'
                      loggedIn
                      className='text-white no-underline my-2 transition duration-200 ease-in-out'
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link to='sign-up' onClick={() => setIsOpen(false)}>
                      <Button className='bg-secondary text-white'>
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
