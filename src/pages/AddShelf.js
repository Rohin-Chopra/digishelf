import { API } from 'aws-amplify'
import React, { useState, useRef } from 'react'
import { FaCheckCircle, FaRegTimesCircle } from 'react-icons/fa'
import Button from '../components/Button'
import { getCurrentUser } from '../utils/auth'
import getBase64Image from '../utils/getBase64Image'
import ClipLoader from 'react-spinners/ClipLoader'
import FormLabel from '../components/FormLabel'
import FormInput from '../components/FormInput'

const AddShelf = ({ history }) => {
  const [inputs, setInputs] = useState({
    name: '',
    description: '',
    coverImg: '',
    visibility: 'private'
  })
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    coverImg: '',
    visibility: '',
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

  const validateInputs = () => {
    let areAllInputsValid = true
    const myErrors = { }
    if (!inputs.name) {
      areAllInputsValid = false
      myErrors.name = 'Name cannot be empty'
    }
    if (!inputs.description) {
      areAllInputsValid = false
      myErrors.description = 'Description cannot be empty'
    }
    if (!inputs.coverImg) {
      areAllInputsValid = false
      myErrors.coverImg = 'You have to upload a image'
    }
    setErrors(myErrors)
    return areAllInputsValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateInputs()) {
      setIsLoading(true)
      const img = await getBase64Image(inputs.coverImg)
      const { token } = await getCurrentUser()

      try {
        await API.post('digishelfApi', '/shelves', {
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
        history.push('/')
      } catch (error) {
        console.log(error)
        setMessage(error.response.data.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <main className='flex flex-col'>
      <div className='container py-4 px-4 mx-auto'>
        <h1 className='prose prose-2xl font-bold text-center'>
          Create a shelf
        </h1>
        <div
          className={`${message ? '' : 'hidden'
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
              <FormLabel>Name</FormLabel>
              <FormInput
                name='name'
                type='text'
                onChange={handleChange}
                value={inputs.name}
                isError={errors.name}
              />
              <small className='text-red-500'>{errors.name}</small>

            </div>
            <div className='my-2'>
              <FormLabel>Description</FormLabel>
              <textarea
                name='description'
                className={`form-input px-3 rounded w-full shadow ${errors.description ? 'border-red-500' : ''
                  }`}
                onChange={handleChange}
              >
                {inputs.description}
              </textarea>
              <small className='text-red-500'>{errors.description}</small>
            </div>
            <div className='my-2'>
              <FormLabel>Cover Image</FormLabel>
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
              <small className='text-red-500 block'>{errors.coverImg}</small>
            </div>
            <div className='my-3'>
              <FormLabel>Visibility</FormLabel>
              <span>
                <input
                  type='radio'
                  value='public'
                  name='visibility'
                  checked={inputs.visibility === 'public'}
                  onChange={handleChange}
                  className='mr-1 p-2 rounded-full'
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
    </main>
  )
}

export default AddShelf
