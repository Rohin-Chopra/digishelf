import React, { useEffect, useState } from 'react'
import { API } from 'aws-amplify'
import { getCurrentUser } from '../utils/auth'
import DiscoverCard from '../components/DiscoverCard'

const Discover = ({ history }) => {
  const [shelves, setShelves] = useState([])

  const fetchShelves = async () => {
    const { token } = await getCurrentUser()
    const { data: { shelves } } = await API.get('digishelfApi', '/shelves', {
      headers: { Authorization: token }
    })
    setShelves(shelves)
  }

  useEffect(() => {
    fetchShelves()
  }, [])
  return <main className='flex flex-col'>
    <div className='container px-6 py-4'>
      <h1 className='prose prose-2xl font-bold'>Discover</h1>
      <div className='flex flex-col items-center'>
        {shelves.map((shelf) => (
          <DiscoverCard key={shelf.id} shelf={shelf} history={history} />
        ))}
      </div>
    </div>
  </main>
}

export default Discover
