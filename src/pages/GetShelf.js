import React, { useEffect, useState } from 'react'
import { API } from 'aws-amplify'
import BeatLoader from 'react-spinners/BeatLoader'
import { FaPlusCircle } from 'react-icons/fa'
import Button from '../components/Button'
import { getCurrentUser } from '../utils/auth'
import movieDb from '../api/movieDb'

const Media = ({ media }) => {
  const [imgUrl, setImgUrl] = useState('')
  const fetchMedia = async () => {
    const { data } = await movieDb.get(`/${media.type}/${media.id}`, {
      params: { api_key: '4e02f274e1c605a2e0b08bac93f177e4' }
    })
    setImgUrl(data.poster_path)
  }
  useEffect(() => {
    fetchMedia()
  }, [])

  return (
    <div>
      <img
        className='max-h-96 rounded shadow-lg mt-2'
        alt='random'
        src={`https://image.tmdb.org/t/p/w500//${imgUrl}`}
      />
    </div>
  )
}

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
        <div className='flex justify-between'>
          <div>
            <h1 className='prose text-xl font-bold'>
              {userName}'s {shelf?.name}
            </h1>
            <p className='prose font-light'>{shelf?.description}</p>
          </div>
          <div>
            <Button
              className='bg-green-500 text-white ml-auto'
              onClick={() =>
                history.push(`/shelves/${match.params.id}/media/add`)
              }
            >
              Add Media
              <FaPlusCircle className='ml-1 inline text-xl' />
            </Button>
          </div>
        </div>
        <div className='mt-2 grid md:grid-cols-4 gap-4 justify-items-center'>
          <BeatLoader css='grid-column: span 4 / span 4;' loading={isLoading} />
          {shelf?.Media.map((media) => {
            return <Media key={media.id} media={media} />
          })}
        </div>
      </div>
    </main>
  )
}

export default GetShelf
