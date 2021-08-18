import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import Button from '../components/Button'

const ShelfCard = ({ shelf, history, children }) => {
  const [isMouseOver, setIsMouseOver] = useState(false)

  return (
    <div
      className='w-80 mb-10 relative cursor-pointer'
      onMouseEnter={() => {
        setIsMouseOver(true)
      }}
      onMouseLeave={() => {
        setIsMouseOver(false)
      }}
    >
      <img
        src={`https://rohin-bucket.s3.ap-southeast-2.amazonaws.com/${shelf.coverImg}`}
        className='w-full h-full rounded shadow  opacity-90'
        alt='lorem ipsum'
      />
      <span
        className={`text-white font-bold absolute ${
          isMouseOver || isMobile ? 'bottom-20' : 'bottom-8'
        }  left-1/3`}
      >
        {shelf.name}
      </span>
      <Button
        className={`${
          isMouseOver ? 'md:opacity-100' : 'md:opacity-0'
        } absolute bottom-8 left-1/3 bg-secondary text-white transition-all`}
        onClick={() => history.push(`/shelves/${shelf.id}`)}
      >
        View
      </Button>
      {children}
    </div>
  )
}

export default ShelfCard
