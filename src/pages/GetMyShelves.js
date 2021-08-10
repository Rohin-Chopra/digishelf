import React, { useEffect } from 'react'
import { API, Auth } from 'aws-amplify'
import { getCurrentUser } from '../utils/auth'

const GetMyShelves = () => {
  const makeRequest = async () => {
    const { token } = await getCurrentUser()
    const res = await API.get('digishelfApi', '/item', {
      headers: { Authorization: token }
    })
    console.log(res)
  }

  useEffect(() => {
    makeRequest()
  }, [])

  return <div>Get my shelves</div>
}

export default GetMyShelves
