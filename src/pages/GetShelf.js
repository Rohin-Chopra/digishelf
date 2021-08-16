import React, { useEffect, useState } from 'react'
import { API } from 'aws-amplify'
import BeatLoader from 'react-spinners/BeatLoader'
import { IoIosAdd } from 'react-icons/io'
import { BiShareAlt } from 'react-icons/bi'
import Button from '../components/Button'
import { getCurrentUser } from '../utils/auth'
import emptyShelfImg from '../images/empty-shelf.png'
import MediaCard from '../components/MediaCard'
const GetShelf = ({ history, match }) => {
  const [shelf, setShelf] = useState(null)
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchShelf = async () => {
    const { user, token } = await getCurrentUser()
    const { shelf } = await API.get(
      'digishelfApi',
      `/shelves/${match.params.id}`,
      {
        headers: {
          Authorization: token
        }
      }
    )
    setUserName(user.attributes.name)
    setIsLoading(false)
    setShelf(shelf)
  }

  useEffect(() => {
    fetchShelf()
  }, [])

  return (
    <main className='flex flex-col'>
      <div className='container px-6 py-4 mx-auto'>
        <div className='flex flex-col justify-center md:flex-row md:justify-between'>
          <div>
            <h1 className='prose text-xl font-bold'>
              {userName}'s {shelf?.name}
            </h1>
            <p className='prose font-light'>{shelf?.description}</p>
          </div>
          <div>
            <Button className='bg-secondary mr-2 text-white'>
              Share <BiShareAlt className='ml-1 inline text-xl' />
            </Button>
            <Button
              className='bg-green-500 rounded-full md:rounded text-center text-white shadow mx-auto fixed bottom-36 right-4 md:static z-50'
              onClick={() =>
                history.push(`/shelves/${match.params.id}/media/add`)
              }
            >
              <span className='hidden md:inline'>Add media</span>
              <IoIosAdd className='md:ml-1 inline text-2xl' />
            </Button>
          </div>
        </div>
        <div className='mt-2 grid md:grid-cols-4 gap-4 justify-items-center'>
          <BeatLoader css='grid-column: span 4 / span 4;' loading={isLoading} />
          {shelf?.Media.map((media) => {
            return <MediaCard key={media.id} media={media} />
          })}
          {shelf?.Media?.length === 0 && !isLoading ? (
            <div className='mt-4 md:col-span-4 flex flex-col items-center'>
              <img
                className='max-h-44 md:max-h-60'
                src={emptyShelfImg}
                alt='An empty shelf'
              />
              <p className='prose mt-4 md:mt-2 text-lg text-center'>
                Looks like it is empty here, add some content to this shelf by
                clicking on add media button
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default GetShelf
