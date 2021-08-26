import React, { useState, useEffect, useRef } from 'react'
import { API } from 'aws-amplify'
import BeatLoader from 'react-spinners/BeatLoader'
import { IoIosAdd } from 'react-icons/io'
import { FaTrash, FaRegEdit, FaSave } from 'react-icons/fa'
import Button from '../components/Button'
import { getCurrentUser } from '../utils/auth'
import ShelfCard from '../components/ShelfCard'
import emptyShelfImg from '../images/empty-shelf.png'
import Modal from './../components/Modal'

const GetMyShelves = ({ history, match }) => {
  const [shelves, setShelves] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [shelfToBeDeleted, setShelfToBeDeleted] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isModalLoading, setIsModalLoading] = useState(false)
  const isMounted = useRef(null)

  const fetchMyShelves = async () => {
    const { token } = await getCurrentUser()
    const { data } = await API.get('digishelfApi', '/shelves/my-shelves', {
      headers: {
        Authorization: token
      }
    })
    setIsLoading(false)
    setShelves(data.shelves)
  }

  useEffect(() => {
    isMounted.current = true
    fetchMyShelves()
  }, [])

  const handleEditButton = () => {
    setIsEditMode(!isEditMode)
  }

  const handleDeleteButton = (shelf) => {
    setShelfToBeDeleted(shelf)
    setShowModal(true)
  }
  const handleDeleteShelf = async () => {
    if (shelfToBeDeleted != null) {
      const { token } = await getCurrentUser()
      setIsModalLoading(true)
      try {
        await API.del('digishelfApi', `/shelves/${shelfToBeDeleted.id}`, {
          headers: {
            Authorization: token
          }
        })
        setIsModalLoading(false)
        setShowModal(false)
        fetchMyShelves()
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <main className='flex flex-col'>
      <div className='container py-4 px-6 mx-auto'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='font-bold text-2xl'>Your Shelves</h1>
          </div>
          <div>
            <Button
              className='bg-yellow-500 rounded text-center text-white shadow mx-auto mr-2'
              onClick={handleEditButton}
            >
              {isEditMode ? (
                <>
                  <span className='align-middle'>Save</span>
                  <FaSave className='ml-2 inline text-xl' />
                </>
              ) : (
                <>
                  <span className='align-middle'>Edit</span>
                  <FaRegEdit className='ml-2 inline text-xl' />
                </>
              )}
            </Button>
            <Button
              className='bg-green-500 rounded-full md:rounded text-center text-white shadow mx-auto fixed bottom-36 right-4 md:static z-50'
              onClick={() => history.push('/add')}
            >
              <span className='hidden md:inline'>Add shelf</span>
              <IoIosAdd className='md:ml-1 inline text-2xl' />{' '}
            </Button>
          </div>
        </div>
        <div>
          <div className='py-4 grid grid-cols-1 md:grid-cols-3 justify-items-center'>
            <BeatLoader
              css='grid-column: span 4 / span 4;'
              loading={isLoading}
            />
            {shelves.map((shelf) => {
              return (
                <ShelfCard key={shelf.id} shelf={shelf} history={history}>
                  {isEditMode ? (
                    <div
                      className='cursor-pointer rounded-full bg-red-500 text-white w-8 h-8 text-center flex items-center justify-center absolute -top-3 -right-3 hover:shadow-lg hover:bg-red-700 shake'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteButton(shelf)
                      }}
                    >
                      <FaTrash className='inline text-lg' />
                    </div>
                  ) : null}
                </ShelfCard>
              )
            })}
            <Modal
              show={showModal}
              setShow={setShowModal}
              title={`Delete ${shelfToBeDeleted?.name}`}
              body={`Do you want to delete ${shelfToBeDeleted?.name}`}
              isLoading={isModalLoading}
              handleSubmit={handleDeleteShelf}
            />

            {shelves.length === 0 && !isLoading ? (
              <div className='mt-4 md:col-span-3 flex flex-col items-center'>
                <img
                  className='max-h-44 md:max-h-60'
                  src={emptyShelfImg}
                  alt='An empty shelf'
                />
                <p className='prose mt-4 md:mt-2 text-lg text-center'>
                  Looks like it is empty here, add some shelves by clicking on
                  add shelf button
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}

export default GetMyShelves
