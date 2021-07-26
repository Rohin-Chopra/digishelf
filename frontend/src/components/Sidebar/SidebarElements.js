import { NavLink as Link } from 'react-router-dom'
import styled from 'styled-components'
import { FaTimes } from 'react-icons/fa'
import Button from './../Button'

export const SidebarContainer = styled.div`
  position: fixed;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  transition: 0.3s ease-in-out;
  opacity: ${({ isOpen }) => (isOpen ? '100%' : '0')};
  top: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
`

export const CloseIcon = styled(FaTimes)`
  color: #fff;
`
export const Icon = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 1.5rem;
  background: transparent;
  font-size: 2rem;
  cursor: pointer;
  outline: none;
`

export const SidebarWrapper = styled.div`
  color: #fff;
`

export const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  list-style-type: none;
  transition: 0.2s ease-in-out;
  text-decoration: none;
  color: #fff;

  &:hover {
    color: ${({ theme }) => theme.primary};
    transition: 0.2s ease-in-out;
  }
`

export const SidebarMenu = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(6, 80px);
  text-align: center;

  @media screen and (max-width: 768px) {
    grid-template-rows: repeat(6, 60px);
  }
`

export const SidebarBtnLink = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  color: #fff;

  &:hover {
    background-color: #e17e86;
  }
`
