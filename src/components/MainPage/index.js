import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPageStyle.css';
import styled, { ThemeProvider } from 'styled-components';
import { darkTheme } from '../../utils/Theme';
import Navbar from '../Navbar';
import Skills from '../Skills';
import Hero from '../HeroSection';
import ChatBot from '../Chatbot';
import Experience from '../Experience';
import Projects from '../Projects';
import Education from '../Education';
import Contact from '../Contact';
import Footer from '../Footer';

const Body = styled.div`
  background-color: ${({ theme }) => theme.bg};
  width: 100%;
  overflow-x: hidden;
`

const Wrapper = styled.div`
  background: linear-gradient(38.73deg, rgba(204, 0, 187, 0.15) 0%, rgba(201, 32, 184, 0) 50%), linear-gradient(141.27deg, rgba(0, 70, 209, 0) 50%, rgba(0, 70, 209, 0.15) 100%);
  width: 100%;
  clip-path: polygon(0 0, 100% 0, 100% 100%,30% 98%, 0 100%);
`

function MainPage() {
  const [openModal, setOpenModal] = useState({ state: false, project: null });
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing tokens)
    navigate('/');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div>
        <Navbar />
        <Body>
          <Hero />
          <Wrapper>
            <Skills />
            <Experience />
          </Wrapper>
          <Projects openModal={openModal} setOpenModal={setOpenModal} />
          <Wrapper>
            <Education />
            <Contact />
          </Wrapper>
          <div className='chatbot-container'>
            <ChatBot />
          </div>
          <Footer />
          {/* <div style={{
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            zIndex: 1000
          }}>
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: '#FF4500',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div> */}
        </Body>
      </div>
    </ThemeProvider>
  );
}

export default MainPage;
