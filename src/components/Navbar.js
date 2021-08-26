import React, { useState, useContext } from 'react'
import { NavLink as Link } from 'react-router-dom'
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa'
import logo from './../images/logo.png'
import Button from './Button'
import AuthContext from '../context/AuthContext'
import NavLink from './NavLink'

const Navbar = (props) => {
  const [authContext] = useContext(AuthContext)
  const loggedIn = authContext !== null
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <nav className='h-50 bg-primary'>
        <div className='container mx-auto flex justify-between py-4 px-10'>
          <Link
            to='/'
            className='text-white no-underline mr-4 transition duration-200 ease-in-out'
          >
            <img src={logo} className='max-h-12' alt='Digishelf logo' />
          </Link>
          <FaBars
            className='block text-2xl absolute top-4 right-0 cursor-pointer text-white md:hidden'
            style={{ transform: 'translate(-100%, 75%)' }}
            onClick={() => setIsOpen(true)}
          />

          <div className='hidden md:flex md:items-center md:justify-center'>
            {loggedIn ? (
              <>
                <NavLink to='/discover' className='text-white mr-4'>
                  Discover
                </NavLink>
                <NavLink to='/' className='text-white mr-4'>
                  My Shelves
                </NavLink>
                <NavLink to='/logout' className='text-black mr-4'>
                  <Button className='bg-white text-black'>
                    Logout <FaSignOutAlt className='inline-block' />
                  </Button>
                </NavLink>
              </>
            ) : (
              <>
                {' '}
                <NavLink to='/login' className='text-white mr-4'>
                  Login
                </NavLink>
                <NavLink to='/sign-up' className='mr-4'>
                  <Button className='bg-secondary text-white'>Sign Up</Button>
                </NavLink>
              </>
            )}
          </div>
          <div
            className={`transition-all fixed z-50 w-full h-full ${isOpen ? 'flex' : 'hidden'
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
            <div>
              <div className='grid grid-cols-1 grid-rows-6 text-center text-2xl'>
                {loggedIn ? (
                  <>
                    <NavLink
                      to='/discover'
                      className='text-white my-2'
                      onClick={() => setIsOpen(false)}
                    >
                      Discover
                    </NavLink>
                    <NavLink
                      to='/'
                      className='text-white my-2'
                      onClick={() => setIsOpen(false)}
                    >
                      My Shelves
                    </NavLink>
                    <NavLink
                      to='/logout'
                      className='text-black my-2'
                      onClick={() => setIsOpen(false)}
                    >
                      <Button className='bg-white'>
                        Logout <FaSignOutAlt className='inline-block' />
                      </Button>
                    </NavLink>
                  </>
                ) : (
                  <>
                    {' '}
                    <NavLink
                      to='/shelves'
                      className='text-white my-2'
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </NavLink>
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
