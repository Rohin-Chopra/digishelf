import React from 'react'

const FormInput = ({ isError, ...otherProps }) => {
  return (
    <input
      className={`form-input px-3 rounded w-full shadow ${isError ? 'border-red-500' : ''
        }`}
      {...otherProps}
    />
  )
}

export default FormInput
