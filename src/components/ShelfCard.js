import React from 'react'
import Button from '../components/Button'

const ShelfCard = ({ shelf, history, children }) => {

  return (
    <div
      className='w-80 mb-10 relative cursor-pointer'
      onClick={() => history.push(`/${shelf.id}`)}
    >
      <img
        src={`https://rohin-bucket.s3.ap-southeast-2.amazonaws.com/${shelf.coverImg}`}
        className='w-full h-full rounded shadow  opacity-90'
        alt='lorem ipsum'
      />
      <span
        className='text-white font-bold absolute bottom-20 left-1/3'
      >
        {shelf.name}
      </span>
      <Button
        className='md:opacity-100 absolute bottom-8 left-1/3 bg-secondary text-white transition-all'>
        View
      </Button>
      {children}
    </div>
  )
}

export default ShelfCard
