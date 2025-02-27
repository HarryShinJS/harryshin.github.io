import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios'; // Import axios
import './LoginStyle.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(e)
    try {
      const tokenData = await loginUser(username, password);
      console.log("Token Data:", tokenData);
      localStorage.setItem('userSession', JSON.stringify({ username, token: tokenData.token }));
      navigate('/main'); // Redirect to main page after successful login
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  async function loginUser(username, password) {
    console.log("sadasads",username, password)
    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        username,
        password
      });
      console.log("Login Response:", JSON.stringify(response.data, null, 2))
      return response.data; // Return the token
    } catch (error) {
      console.error("ㄴㅁㅇㅁㄴㅇㅁ",error);
      throw error; // Re-throw the error to be handled by the calling code
    }
  }

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit">Login</button>
          <button type="button" onClick={handleSignUp}>Sign Up</button>
        </div>
      </form>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default Login;