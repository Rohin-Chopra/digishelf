import { API } from 'aws-amplify'
import React, { useState, useRef } from 'react'
import { FaCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import Button from '../components/Button'
import { getCurrentUser } from '../utils/auth'
import getBase64Image from '../utils/getBase64Image'
import ClipLoader from 'react-spinners/ClipLoader'

const AddShelf = ({ history }) => {
  const [inputs, setInputs] = useState({
    name: '',
    description: '',
    coverImg: '',
    visibility: ''
  })
  const [errors, setErrors] = useState({
    name: false,
    description: false,
    coverImg: false,
    visibility: false
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fileInput = useRef(null)

  const handleClick = (event) => {
    fileInput.current.click()
  }
  const handleChange = ({ target }) => {
    const { name, value } = target
    setInputs((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleFileChange = async ({ target }) => {
    if (target.files && target.files.length > 0) {
      setInputs((prevState) => ({
        ...prevState,
        coverImg: target.files[0]
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (inputs.coverImg) {
      setIsLoading(true)
      const img = await getBase64Image(inputs.coverImg)
      const { token } = await getCurrentUser()

      try {
        await API.post('digishelfAPI', '/shelves', {
          headers: {
            Authorization: token
          },
          body: {
            coverImg: img,
            name: inputs.name,
            description: inputs.description,
            visibility: inputs.visibility
          }
        })
        history.push('/shelves')
      } catch (error) {
        console.log(error)
        setMessage(error.response.data.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className='container py-4 px-4 mx-auto'>
      <h1 className='prose prose-2xl font-bold text-center'>Create a shelf</h1>
      <div
        className={`${
          message ? '' : 'hidden'
        } bg-red-500 rounded shadow-lg mx-auto py-2 px-2 text-white mb-2`}
        style={{ maxWidth: '30rem' }}
      >
        <FaRegTimesCircle className='inline font-bold text-2xl mr-2' />
        {message}
      </div>
      <div
        className='rounded shadow-lg py-6 px-4 mx-auto'
        style={{ maxWidth: '30rem' }}
      >
        <form onSubmit={handleSubmit}>
          {' '}
          <div className='my-2'>
            <label className='block'>Name</label>
            <input
              name='name'
              type='text'
              className={`form-input px-3 rounded w-full shadow ${
                errors.name ? 'border-red-500' : ''
              }`}
              value={inputs.name}
              onChange={handleChange}
            />
          </div>
          <div className='my-2'>
            <label className='block'>Description</label>
            <textarea
              name='description'
              className={`form-input px-3 rounded w-full shadow ${
                errors.description ? 'border-red-500' : ''
              }`}
              onChange={handleChange}
            >
              {inputs.description}
            </textarea>
          </div>
          <div className='my-2'>
            <label className='block'>Cover Image</label>
            <input
              type='file'
              name='coverImg'
              ref={fileInput}
              onChange={handleFileChange}
              className='hidden'
            />
            <Button
              className='mt-2 bg-primary text-white'
              onClick={handleClick}
            >
              {inputs.coverImg ? (
                <span>
                  Uploaded <FaCheckCircle className='inline' />
                </span>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
          <div className='my-3'>
            <label className='block'>Visibility</label>
            <span>
              <input
                type='radio'
                value='public'
                name='visibility'
                checked={inputs.visibility === 'public'}
                onChange={handleChange}
                class='mr-1 p-2 rounded-full'
              />
              Public
            </span>
            <span className='ml-2'>
              <input
                type='radio'
                value='private'
                name='visibility'
                checked={inputs.visibility === 'private'}
                onChange={handleChange}
                class='mr-1 p-2 rounded-full text-pink-500'
              />
              Private
            </span>
          </div>
          {isLoading ? (
            <Button className='bg-green-500 text-white mt-2'>
              {' '}
              <ClipLoader
                height={20}
                width={20}
                css={`
                  height: 20px;
                  width: 20px;
                  color: white;
                `}
              />
            </Button>
          ) : (
            <input
              type='submit'
              className='inline-block text-center whitespace-nowrap align-middle py-2 px-2 border border-solid border-transparent rounded shadow cursor-pointer transition-colors	transition-shadow mt-2 bg-green-500 text-white'
              value='Create'
            />
          )}
        </form>
      </div>
    </div>
  )
}

export default AddShelf
