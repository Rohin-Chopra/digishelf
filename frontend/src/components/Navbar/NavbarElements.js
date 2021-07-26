import styled from 'styled-components'
import { NavLink as Link } from 'react-router-dom'
import { FaBars } from 'react-icons/fa'
import Button from './../Button'

export const Nav = styled.nav`
  height: 80px;
  background-color: ${({ theme }) => theme.lightGreen};
  display: flex;
  justify-content: space-between;
  padding: 18px 30px;
`
export const NavLink = styled(Link)`
  color: ${({ theme }) => theme.black};
  text-decoration: none;
  font-size: 1.2rem;
  margin-right: 1rem;
  transition: 0.2s all ease-in-out;
  &:hover {
    transition: 0.2s all ease-in-out;
    color: ${({ theme }) => theme.primary};
  }
`

export const Bars = styled(FaBars)`
  display: none;
  @media (max-width: 767.98px) {
    display: block;
  }
`

export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
export const NavBtn = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  color: #fff;

  &:hover {
    background-color: #e17e86;
  }
`
