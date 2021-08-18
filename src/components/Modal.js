import React, { Children } from 'react'
import Button from './Button'

const Modal = ({ children, show, setShow }) => {
  let _body, _title, _actionButton, _cancelButton

  Children.forEach(children, (child) => {
    console.log({ child })
    if (child?.type?.name === 'ModalTitle') {
      return (_title = child)
    } else if (child?.type?.name === 'ModalBody') {
      return (_body = child)
    }
    switch (child?.type?.name) {
      case 'ModalTitle':
        return (_title = child)
      case 'ModalBody':
        return (_body = child)
      case 'ActionButton':
        return (_actionButton = child)
      case 'CancelButton':
        return (_cancelButton = child)
      default:
        break
    }
  })
  return show ? (
    <div
      class='fixed z-10 inset-0 overflow-y-auto'
      aria-labelledby='modal-title'
      role='dialog'
      aria-modal='true'
    >
      <div class='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div
          class='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          aria-hidden='true'
        ></div>

        <span
          class='hidden sm:inline-block sm:align-middle sm:h-screen'
          aria-hidden='true'
        >
          &#8203;
        </span>

        <div class='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div class='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div class='sm:flex sm:items-start'>
              <div class='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
                <svg
                  class='h-6 w-6 text-red-600'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                  />
                </svg>
              </div>
              <div class='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                {_title}
                <div class='mt-2'>{_body}</div>
              </div>
            </div>
          </div>
          <div class='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            {_actionButton}

            {_cancelButton}
          </div>
        </div>
      </div>
    </div>
  ) : null
}
const ModalTitle = ({ children }) => (
  <h3 className='text-lg leading-6 font-medium text-gray-900' id='modal-title'>
    {children}
  </h3>
)
const ModalBody = ({ children }) => (
  <p class='text-sm text-gray-500' id='modal-body'>
    {children}
  </p>
)
const ActionButton = ({ children, className, ...otherProps }) => (
  <Button
    {...otherProps}
    className={`mt-3 w-full inline-flex justify-center rounded-md  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${className}`}
  >
    {children}
  </Button>
)
//
const CancelButton = ({ children, className, ...otherProps }) => (
  <Button
    {...otherProps}
    className={`mt-3 w-full inline-flex justify-center rounded-md  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${className}`}
  >
    {children}
  </Button>
)
Modal.Title = ModalTitle
Modal.Body = ModalBody
Modal.ActionButton = ActionButton
Modal.CancelButton = CancelButton

export default Modal
