import React, { useEffect, useState } from 'react'
import { API } from 'aws-amplify'
import BeatLoader from 'react-spinners/BeatLoader'
import { getCurrentUser } from '../utils/auth'
import DiscoverCard from '../components/DiscoverCard'


const Discover = ({ history }) => {
  const [shelves, setShelves] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchShelves = async () => {
    const { token } = await getCurrentUser()
    const { data: { shelves } } = await API.get('digishelfApi', '/shelves', {
      headers: { Authorization: token }
    })
    setIsLoading(false)
    setShelves(shelves)
  }

  useEffect(() => {
    fetchShelves()
  }, [])
  return <main className='flex flex-col'>
    <div className='container px-6 py-4'>
      <h1 className='prose prose-2xl font-bold'>Discover</h1>
      <div className='flex flex-col items-center'>
      <BeatLoader css='grid-column: span 4 / span 4;' loading={isLoading} />
        {shelves.map((shelf) => (
          <DiscoverCard key={shelf.id} shelf={shelf} history={history} />
        ))}
      </div>
    </div>
  </main>
}

export default Discover
