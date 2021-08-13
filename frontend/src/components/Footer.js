import React from 'react'
import { FaGithub as GithubIcon } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className='bg-secondary w-full py-8 flex justify-center items-center flex-col'>
      <h4 className='prose prose-lg text-black'>
        Developed By <span className='font-bold mb-2'>Rohin Chopra</span>
      </h4>
      <a
        target='_blank'
        rel='noopener noreferrer'
        href='https://github.com/Rohin1212'
      >
        <GithubIcon className='text-black text-4xl' />
      </a>
    </footer>
  )
}

export default Footer
