import React from 'react'

const FormInput = ({ isError, className, ...otherProps }) => {
  return (
    <input
      className={`form-input  rounded w-full shadow border border-gray-500 px-2 py-1 ${isError ? 'border-red-500' : ''
        } ${className}`}
      {...otherProps}
    />
  )
}

export default FormInput
