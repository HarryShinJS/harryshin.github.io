import React from 'react'
import { Nav, NavLink, NavbarContainer, NavLogo, NavItems, GitHubButton, ButtonContainer, MobileIcon, MobileMenu } from './NavbarStyledComponent'
import { DiCssdeck } from 'react-icons/di'
import { FaBars } from 'react-icons/fa'
// rafce 하면 react 기본 반응 요소 코드 로드

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  //const theme = useTheme();
  return (
    <Nav>
      <NavbarContainer>
        <NavLogo to="/main">
          <a
            style={{
              display : "flex",
              alignItems : "center",
              color : "white",
              marginBottom : "20;",
              cursor : "pointer",
            }}
          >
            <DiCssdeck size="3rem" /><span>Portfolio</span>
          </a>
        </NavLogo>
        <MobileIcon>
          <FaBars 
            onClick = {() => {
              setOpen(!open);
            }}
          />
        </MobileIcon>
        <NavItems>
          <NavLink href="#about">About</NavLink>
          <NavLink href='#skills'>Skills</NavLink>
          <NavLink href='#experience'>Experience</NavLink>
          <NavLink href='#projects'>Projects</NavLink>
          <NavLink href='#education'>Education</NavLink>
        </NavItems>
        <ButtonContainer>
          <GitHubButton>Github Profile</GitHubButton>
        </ButtonContainer>
      </NavbarContainer>
      { open && ( <MobileMenu open={open}></MobileMenu> )}
    </Nav>
  );
}

export default Navbar;