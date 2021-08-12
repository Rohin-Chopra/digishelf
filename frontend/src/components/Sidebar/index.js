import React from 'react'
import { NavLink as Link } from 'react-router-dom'

import {
  SidebarWrapper,
  SidebarContainer,
  SidebarMenu,
  SidebarLink,
  SidebarBtnLink,
  Icon,
  CloseIcon
} from './SidebarElements'

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <SidebarContainer isOpen={isOpen}>
      <Icon>
        <CloseIcon onClick={() => setIsOpen(false)} />
      </Icon>
      <SidebarWrapper>
        <SidebarMenu>
          <SidebarLink to='/login' onClick={() => setIsOpen(false)}>
            Login
          </SidebarLink>
          <Link to='/sign-up' onClick={() => setIsOpen(false)}>
            <SidebarBtnLink>Sign Up</SidebarBtnLink>
          </Link>
        </SidebarMenu>
      </SidebarWrapper>
    </SidebarContainer>
  )
}

export default Sidebar
