import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { API } from 'aws-amplify'
import { getAccessJwtToken, getCurrentUser } from '../utils/auth'
import Button from '../components/Button'

const Media = () => {
  return (
    <div>
      <img
        className='max-h-96 rounded shadow-lg mt-2'
        alt='random'
        src='https://image.tmdb.org/t/p/w500//qAZ0pzat24kLdO3o8ejmbLxyOac.jpg'
      />
    </div>
  )
}

const GetShelf = ({ history, match }) => {
  const [shelf, setShelf] = useState(null)
  const [userName, setUserName] = useState('')

  const fetchShelf = async () => {
    const { user, token } = await getCurrentUser()
    const { data } = await axios.get(
      `https://sdhr3phfz1.execute-api.ap-southeast-2.amazonaws.com/dev/shelves/${match.params.id}`,
      {
        headers: {
          Authorization: token
        }
      }
    )
    setUserName(user.attributes.name)
    setShelf(data.shelf)
  }

  useEffect(() => {
    fetchShelf()
  }, [])

  return (
    <div className='container px-6 py-4'>
      <h1 className='prose text-xl font-bold'>
        {userName}'s {shelf?.name}
      </h1>
      <p className='prose font-light'>{shelf?.description}</p>
      <Button
        className='bg-green-500 text-white ml-auto'
        onClick={() => history.push(`/shelves/${match.params.id}/media/add`)}
      >
        Add Media
      </Button>
      <div className='mt-2 grid md:grid-cols-4 justify-items-center'>
        {/* {
         shelf.Media.map(()=>{

         })
       } */}
      </div>
    </div>
  )
}

export default GetShelf
