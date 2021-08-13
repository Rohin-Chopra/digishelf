import React, { useState, useEffect } from 'react'
import { API } from 'aws-amplify'
import { getCurrentUser } from '../utils/auth'
import { FaPlusCircle } from 'react-icons/fa'
import Button from '../components/Button'

const ShelfCard = ({ shelf, history }) => {
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
          isMouseOver ? 'bottom-20' : 'bottom-8'
        } left-1/3`}
      >
        {shelf.name}
      </span>
      <Button
        className={`${
          isMouseOver ? 'opacity-100' : 'opacity-0'
        } absolute bottom-8 left-1/3 bg-secondary text-white transition-all`}
        onClick={() => history.push(`/shelves/${shelf.id}`)}
      >
        View
      </Button>
    </div>
  )
}

const GetMyShelves = ({ history, match }) => {
  const [shelves, setShelves] = useState([])

  const makeRequest = async () => {
    const { token } = await getCurrentUser()
    const { data } = await API.get('digishelfAPI', '/shelves/my-shelves', {
      headers: {
        Authorization: token
      }
    })
    setShelves(data.shelves)
  }

  useEffect(() => {
    makeRequest()
  }, [])

  return (
    <main className='flex flex-col'>
      <div className='container py-4 px-6 mx-auto'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='font-bold text-2xl'>Your Shelves</h1>
          </div>
          <div>
            <Button
              className='bg-green-500 text-white shadow mx-auto'
              onClick={() => history.push('/shelves/add')}
            >
              Add Shelf <FaPlusCircle className='ml-1 inline text-xl' />
            </Button>
          </div>
        </div>
        <div>
          <div className='py-4 grid grid-cols-1 md:grid-cols-3 justify-items-center'>
            {shelves.map((shelf) => {
              return (
                <ShelfCard key={shelf.id} shelf={shelf} history={history} />
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

export default GetMyShelves
