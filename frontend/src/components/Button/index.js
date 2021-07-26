import React from 'react'
import { Button as StyledButton } from './ButtonElements'

const Button = ({ className, children }) => {
  return <StyledButton className={className}>{children}</StyledButton>
}

export default Button
