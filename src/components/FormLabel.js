import React from 'react'

const FormLabel = ({ children, className, ...otherProps }) => {
  return (
    <label className={`mb-1 block text-gray-500 ${className}`} {...otherProps}>
      {children}
    </label>
  )
}

export default FormLabel
