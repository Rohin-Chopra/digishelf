/* eslint-disable jsx-a11y/alt-text */
import React, { Fragment, useEffect, useState } from 'react'
import { Carousel } from 'react-responsive-carousel'
import { FaUserPlus as AddUserIcon } from 'react-icons/fa'
import { IoLibrary as LibraryIcon } from 'react-icons/io5'
import { GiDramaMasks as DramaIcon } from 'react-icons/gi'
import Button from '../components/Button'
import movieDBAPI from '../api/movieDb'
import bookshelfImg from './../images/bookshelf.png'

const SlideItem = ({ moviePosterImgs, start = 0, end }) => {
  return (
    <div className='grid grid-cols-3 md:grid-cols-6'>
      {moviePosterImgs.map((moviePosterImg, index) => {
        if (index > start && index < end) {
          return <img className='md:h-96' src={moviePosterImg} key={index} />
        }
      })}
    </div>
  )
}

const Card = ({ heading, number, children, invert = false }) => {
  return (
    <div className='flex flex-col items-center'>
      <div
        className={`rounded-full h-12 w-12 flex items-center justify-center bg-${
          invert ? 'white' : 'secondary text-white'
        } relative top-8`}
      >
        {number}
      </div>
      <div
        className={`bg-${
          invert ? 'secondary' : 'white'
        } rounded-lg shadow-md text-center flex flex-col justify-center items-center py-8 px-6 w-60 h-56 my-2`}
      >
        <h4 className='prose prose-xl font-bold'>{heading}</h4>
        {children}
      </div>
    </div>
  )
}

const HomeScreen = () => {
  const [moviePosterImgs, setMoviePosterImgs] = useState([])

  const makeRequest = async () => {
    const res = await movieDBAPI.get('/discover/movie', {
      params: { api_key: '4e02f274e1c605a2e0b08bac93f177e4' }
    })
    const temp = []
    res.data.results.forEach((movie) => {
      temp.push(`https://image.tmdb.org/t/p/w500/${movie.poster_path}`)
    })
    setMoviePosterImgs(temp)
  }

  useEffect(() => {
    makeRequest()
  }, [])
  return (
    <div>
      <div className='bg-primary  py-4 px-6 pb-8 md:pt-4 text-white'>
        <div className='container mx-auto px-4'>
          <div className='md:grid md:grid-cols-2 md:gap-10'>
            <div className='md:pt-3'>
              <h1 className='prose prose-2xl text-white font-bold'>
                Capture your favorite content
              </h1>
              <p className='prose text-white'>
                Digishelf allows you to capture your favorite tv shows and books
                on a digital shelf
              </p>
              <Button className='bg-secondary mt-2'>Get Started</Button>
            </div>
            <div className='hidden md:flex md:justify-end'>
              <img className='h-60' src={bookshelfImg} />
            </div>
          </div>
        </div>
      </div>
      <div className='pt-4'>
        <h3
          className='prose prose-xl font-bold text-center mb-4'
          style={{ maxWidth: 'none' }}
        >
          Capture the content you want to remember.
        </h3>
        <Carousel
          showArrows={false}
          showStatus={false}
          showIndicators={false}
          autoPlay
          infiniteLoop
          interval={3000}
        >
          <div>
            <SlideItem moviePosterImgs={moviePosterImgs} end={7} />
          </div>
          <div>
            <SlideItem moviePosterImgs={moviePosterImgs} start={7} end={14} />
          </div>
          <div>
            <SlideItem moviePosterImgs={moviePosterImgs} start={13} end={20} />
          </div>
        </Carousel>
      </div>
      <div className='bg-primary -mt-10'>
        <div className='container py-4 px-4 mx-auto'>
          <h3 className='prose prose-xl font-bold text-white text-center mt-4 mb-1'>
            How does it work?
          </h3>
          <div className='grid justify-center md:grid-cols-4 md:gap-4'>
            <Card heading='Sign Up' number={1}>
              <AddUserIcon className='text-7xl' />
            </Card>
            <Card heading='Create a digishelf' number={2}>
              <LibraryIcon className='text-7xl' />
            </Card>
            <Card heading='Store your favorite content' number={3}>
              <DramaIcon className='text-7xl' />
            </Card>
            <Card
              className='bg-secondary'
              heading='Share your shelf with others'
              number={4}
              invert
            >
              <p>
                Let others view your shelf or just cherish those moments for
                yourself
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
