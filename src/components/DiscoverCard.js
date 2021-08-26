import React from 'react'
import Gravatar from 'react-gravatar'

const DiscoverCard = ({ shelf, history }) => {
  return (
    <div className='shadow-lg rounded-lg w-80 my-4 relative cursor-pointer w-80 md:w-96' onClick={() => history.push(`/${shelf.id}`)}>
      <div className='py-2 px-2'>
        <Gravatar email={shelf.createdBy} className='rounded-full inline' size={35} />
        <span className='ml-2 prose prose-sm text-gray-600'>Rohin Chopra</span>
      </div>
      <div>
        <img src={`https://rohin-bucket.s3.ap-southeast-2.amazonaws.com/${shelf.coverImg}`}
          className=""
        />
        <span
          className={`text-white font-bold absolute bottom-10 left-1/3`}
        >
          {shelf.name}
        </span>
      </div>
    </div>
  )
}

export default DiscoverCard
