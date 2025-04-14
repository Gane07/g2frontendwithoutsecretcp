import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AuthStyles.css';

function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

  // Create axios instance with default config
  const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL_USER}`,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Step 1: Request temporary password
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setModalMessage('Please enter your username.');
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/user/forgetpassword/${encodeURIComponent(username)}`);
      
      // Handle response (string or object)
      const tempPassword = typeof response.data === 'object' 
        ? response.data.temporaryPassword 
        : response.data;
      
      setTemporaryPassword(tempPassword);
      setModalMessage(`Your temporary password is: ${tempPassword}. Please use it to change your password.`);
      setShowModal(true);
      setShowChangePassword(true);
    } catch (error) {
      let errorMsg = 'Failed to generate temporary password.';
      if (error.response) {
        errorMsg = typeof error.response.data === 'object'
          ? error.response.data.message || JSON.stringify(error.response.data)
          : error.response.data || errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setModalMessage(errorMsg);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle change password submission
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setModalMessage('Please fill in both old and new passwords.');
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/user/changepassword', {
        username,
        oldPassword,
        newPassword
      });
      
      if (response.data === 'Password changed successfully' || response.status === 200) {
        setModalMessage('Password changed successfully! Redirecting to login...');
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate('/login');
        }, 2000);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      let errorMsg = 'Failed to change password.';
      if (error.response) {
        errorMsg = typeof error.response.data === 'object'
          ? error.response.data.message || JSON.stringify(error.response.data)
          : error.response.data || errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setModalMessage(errorMsg);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (!showChangePassword) {
      setUsername('');
    }
  };

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="auth-card">
              <Card.Body>
                {!showChangePassword ? (
                  <>
                    <h2 className="auth-title text-center mb-4">Forgot Password</h2>
                    <Form onSubmit={handleForgotPasswordSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.trim())}
                          disabled={isLoading}
                          required
                        />
                      </Form.Group>
                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Get Temporary Password'}
                      </Button>
                    </Form>
                  </>
                ) : (
                  <>
                    <h2 className="auth-title text-center mb-4">Change Password</h2>
                    <Form onSubmit={handleChangePasswordSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          value={username}
                          disabled
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Temporary Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter temporary password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </Form.Group>
                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Change Password'}
                      </Button>
                    </Form>
                  </>
                )}
                <p className="text-center mt-3">
                  Back to <Link to="/login">Login</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {showChangePassword ? 'Password Change' : 'Temporary Password'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ForgotPassword;