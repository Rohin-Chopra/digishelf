import React from 'react'

const Button = ({ className, children, disabled, ...props }) => {
  return (
    <button
      className={`${className} inline-block text-center whitespace-nowrap align-middle py-2 px-2 border border-solid border-transparent rounded shadow cursor-pointer transition-colors	transition-shadow`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
