import React, { useEffect, useState, Fragment } from 'react'
import { API } from 'aws-amplify'
import BeatLoader from 'react-spinners/BeatLoader'
import { FaTrash, FaRegEdit, FaSave } from 'react-icons/fa'
import { IoIosAdd } from 'react-icons/io'
import Button from '../components/Button'
import { getCurrentUser } from '../utils/auth'
import emptyShelfImg from '../images/empty-shelf.png'
import MediaCard from '../components/MediaCard'
import FormInput from '../components/FormInput'

const GetShelf = ({ history, match }) => {
  const [shelf, setShelf] = useState(null)
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isUsersOwnShelf, setIsUsersOwnShelf] = useState(false)
  const [inputs, setInputs] = useState({ })

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
    setIsUsersOwnShelf(user.attributes.email === shelf.createdBy)
    setIsLoading(false)
    setShelf(shelf)
    setInputs(shelf)
  }

  useEffect(() => {
    setIsUsersOwnShelf(false)
    fetchShelf()
  }, [])
  const handleEditButton = async () => {
    if (isEditMode) {
      const { token } = await getCurrentUser()
      await API.put(
        'digishelfApi',
        `/shelves/${match.params.id}`,
        {
          body: inputs,
          headers: {
            Authorization: token
          }
        }
      )
      fetchShelf()
    }
    setIsEditMode(!isEditMode)
  }
  const handleDeleteButton = async (mediaId) => {
    if (mediaId) {
      try {
        const { token } = await getCurrentUser()
        await API.del('digishelfApi', `/shelves/${match.params.id}/media/${mediaId}`, {
          headers: {
            Authorization: token
          }
        })
        fetchShelf()
      } catch (err) {
        console.log(err)
      }
    }
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setInputs({
      ...inputs,
      [name]: value
    })
  }
  return (
    <main className='flex flex-col'>
      <div className='container px-6 py-4 mx-auto'>
        <div className='flex flex-col justify-center md:flex-row md:justify-between'>
          <div>
            <h1 className='prose text-xl font-bold'>
              {userName}'s {isEditMode
                ?
                <FormInput
                  className='border rounded w-auto'
                  style={{ display: 'inline', width: 'auto' }}
                  name='name'
                  value={inputs.name}
                  onChange={handleChange}
                />
                : shelf?.name
              }
            </h1>
            {isEditMode
              ?
              <FormInput className='inline border rounded w-auto my-2' style={{ display: 'inline', width: 'auto' }} name='description' value={inputs.description} onChange={handleChange} />
              :
              <p className='prose font-light'>{shelf?.description}</p>
            }

          </div>
          <div>
            {isUsersOwnShelf && <Button
              className='bg-yellow-500 text-center text-white shadow mx-auto mr-2'
              onClick={handleEditButton}
            >
              {isEditMode ? (
                <Fragment>
                  Save
                  <FaSave className='ml-2 inline text-xl align-text-top' />
                </Fragment>
              ) : (
                <Fragment>
                  Edit
                  <FaRegEdit className='ml-2 inline text-xl align-text-top' />
                </Fragment>
              )}
            </Button>
            }

            {isUsersOwnShelf && <Button
              className='bg-green-500 rounded-full md:rounded text-center text-white shadow mx-auto fixed bottom-36 right-4 md:static z-50'
              onClick={() =>
                history.push(`/${match.params.id}/media/add`)
              }
            >
              <span className='hidden md:inline'>Add media</span>
              <IoIosAdd className='inline text-2xl' />
            </Button>
            }
          </div>
        </div>
        <div className='mt-2 grid md:grid-cols-4 gap-4 justify-items-center'>
          <BeatLoader css='grid-column: span 4 / span 4;' loading={isLoading} />
          {shelf?.Media.map((media) => {
            return (
              <MediaCard key={media.id} media={media}>
                {isEditMode ? (
                  <div
                    className='cursor-pointer rounded-full bg-red-500 text-white w-8 h-8 text-center flex items-center justify-center absolute -top-2 -right-3 hover:shadow-lg hover:bg-red-700 shake'
                    onClick={() => handleDeleteButton(media.id)}
                  >
                    <FaTrash className='inline text-lg' />
                  </div>
                ) : null}
              </MediaCard>
            )
          })}
          {shelf?.Media?.length === 0 && !isLoading && (
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
          )}
        </div>
      </div>
    </main>
  )
}

export default GetShelf
