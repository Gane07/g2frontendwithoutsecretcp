import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import '../styles/AuthStyles.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setModalMessage('Please enter both username and password.');
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL_USER}/user/authenticate`, {
        username,
        password,
      });
      if (response.data === 'User Authenticate Successfully') {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', username);
        setModalMessage('Login successful! Redirecting to Explore...');
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate('/');
        }, 2000);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      const errorMsg ='Login failed. Please check your credentials.';
      setModalMessage(errorMsg);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Handle navigation to Forgot Password explicitly if needed
  const handleForgotPasswordClick = () => {
    console.log('Navigating to /forgot-password'); // Debug log
    navigate('/forgot-password');
  };

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="auth-card">
              <Card.Body>
                <h2 className="auth-title text-center mb-4">Login</h2>
                <Form className="auth-form" onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.trim())} // Trim whitespace
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <div className="password-wrapper">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <span className="password-toggle" onClick={togglePasswordVisibility}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </Form.Group>

                  <div className="d-flex justify-content-between mb-4">
                    <Link
                      to="/forgot-password"
                      className="auth-link small"
                      onClick={handleForgotPasswordClick} // Optional for debugging
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    className="auth-button w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </Form>

                <p className="text-center mt-3">
                  Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Login;