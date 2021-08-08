import React from 'react'
import {
  FaGithub as GithubIcon,
  FaLinkedin as LinkedInIcon
} from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className='bg-secondary w-full py-8 flex justify-center items-center flex-col'>
      <h4 className='prose prose-lg text-black'>
        Developed By <span className='font-bold mb-2'>Rohin Chopra</span>
      </h4>
      <p>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href='https://github.com/Rohin1212'
          className='text-black text-4xl mx-2'
        >
          <GithubIcon className='inline' />
        </a>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href='https://github.com/Rohin1212'
          className='text-black text-4xl mx-2'
        >
          <LinkedInIcon className='inline' />
        </a>
      </p>
    </footer>
  )
}

export default Footer
