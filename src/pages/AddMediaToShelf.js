import axios from 'axios'
import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import Button from '../components/Button'
import movieDb from '../api/movieDb'
import { getCurrentUser } from '../utils/auth'
import { API } from 'aws-amplify'
import FormLabel from '../components/FormLabel'

const AddMediaToShelf = ({ history, match }) => {
  const [shelf, setShelf] = useState(null)
  const [mediaId, setMediaId] = useState('')
  const [category, setCategory] = useState('tv')
  const [typingTimeout, setTypingTimeout] = useState(null)
  const [error, setError] = useState('')

  const categoryOptions = [
    { value: 'tv', label: 'Tv' },
    { value: 'movie', label: 'Movie' }
  ]

  const fetchShelf = async () => {
    const { token } = await getCurrentUser()
    const { data: { shelf } } = await axios.get(
      `https://sdhr3phfz1.execute-api.ap-southeast-2.amazonaws.com/dev/shelves/${match.params.id}`,
      {
        headers: {
          Authorization: token
        }
      }
    )
    setShelf(shelf)
  }

  useEffect(() => {
    fetchShelf()
  }, [])

  // cleanup for typing timeouts
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout)
    }
  }, [typingTimeout])

  const handleChange = async (q) =>
    new Promise((resolve, reject) => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
      setTypingTimeout(
        setTimeout(async () => {
          const res = await movieDb.get(`/search/${category}`, {
            params: {
              api_key: '4e02f274e1c605a2e0b08bac93f177e4',
              query: q
            }
          })
          let inputs =
            res.data.results.length > 5
              ? res.data.results.splice(0, 5)
              : res.data.results
          inputs = inputs.map((val, i) => ({
            label: val.name || val.title,
            key: val.id
          }))

          resolve(inputs)
        }, 2000)
      )
    })

  const handleSubmit = async () => {
    if (!mediaId) {
      return setError('Select name of the media')
    }
    setError('')
    const { token } = await getCurrentUser()
    try {
      await API.post('digishelfApi', `/shelves/${match.params.id}/media`, {
        headers: {
          Authorization: token
        },
        body: {
          mediaType: category,
          mediaId
        }
      })

      history.push(`/${match.params.id}`)
    } catch (error) {
      console.log(error.response)
    }
  }

  return (
    <main className='flex flex-col items-center container px-4'>
      <h1 className='prose prose-2xl font-bold mb-4'>
        Add Media to your {shelf?.name} shelf
      </h1>
      <div className='py-4 px-6 shadow-lg rounded w-full md:w-96'>
        <div className='mb-2'>
          <FormLabel>Category</FormLabel>
          <Select
            className='mt-2'
            defaultValue={categoryOptions[0]}
            name='category'
            options={categoryOptions}
            isSearchable={false}
            onChange={({ value }) => setCategory(value)}
            styles={{
              input: (base) => ({
                ...base,
                'input:focus': {
                  boxShadow: 'none'
                }
              })
            }}
          />
        </div>

        <div className='my-3'>
          <FormLabel>Name</FormLabel>
          <AsyncSelect
            className='my-2'
            cacheOptions
            defaultOptions
            loadOptions={handleChange}
            styles={{
              input: (base) => ({
                ...base,
                'input:focus': {
                  boxShadow: 'none'
                }
              })
            }}
            onChange={({ key }) => setMediaId(key)}
          />
          <span className='text-red-500'>{error}</span>
        </div>
        <Button className='bg-green-500 text-white' onClick={handleSubmit}>
          Add
        </Button>
      </div>
    </main>
  )
}

export default AddMediaToShelf
