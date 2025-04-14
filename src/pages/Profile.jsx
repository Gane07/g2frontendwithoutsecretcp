import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Form, Button, Modal, Image } from 'react-bootstrap';
import axios from 'axios';
import IdeaCard from '../components/IdeaCard'; // Assuming this path
import '../styles/AuthStyles.css';

function Profile() {
  const [userIdeas, setUserIdeas] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: ''
  });
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [editProfile, setEditProfile] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const username = sessionStorage.getItem('username');

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) {
        setModalMessage('No username found in sessionStorage. Please log in.');
        setShowModal(true);
        return;
      }

      try {
        // Fetch user's profile (Port 8082 for user service)
        const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL_USER}/user/get/${username}`);
        const userData = profileResponse.data;
        setUserProfile({
          username: userData.username || '',
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          bio: userData.bio || ''
        });

        // Fetch profile image (Port 8082)
        const imageResponse = await axios.get(`${process.env.REACT_APP_API_URL_USER}/user/profile-image/${username}`, { responseType: 'blob' });
        setProfileImageUrl(URL.createObjectURL(imageResponse.data));

        // Fetch user's ideas (Port 8083 for ideas service)
        const ideasResponse = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/getAll/${username}`);
        const ideas = Array.isArray(ideasResponse.data) ? ideasResponse.data : [];
        setUserIdeas(ideas);

        // Calculate total likes (assuming likes field exists in ideas)
        const likes = ideas.reduce((sum, idea) => sum + (idea.likes || 0), 0);
        setTotalLikes(likes);

        // Fetch user's comments (Port 8084 for comments service)
        const commentsResponse = await axios.get(`${process.env.REACT_APP_API_URL_COMMENT}/comments/userbycomment/${username}`);
        if (Array.isArray(commentsResponse.data)) {
          const commentsWithTitles = await Promise.all(
            commentsResponse.data.map(async (comment) => {
              try {
                const ideaResponse = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/getbyid/${comment.ideaId}`);
                return { ...comment, ideaTitle: ideaResponse.data.title };
              } catch (error) {
                console.error(`Error fetching idea title for ideaId ${comment.ideaId}:`, error);
                return { ...comment, ideaTitle: 'Unknown Idea' };
              }
            })
          );
          setUserComments(commentsWithTitles);
        } else {
          setUserComments([]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error.response || error.message);
        setModalMessage(error.response?.data || 'Failed to load profile data.');
        setShowModal(true);
      }
    };
    fetchUserData();
  }, [username]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updatedProfile = {
      username: editProfile.username,
      email: editProfile.email,
      firstName: editProfile.firstName,
      lastName: editProfile.lastName,
      bio: editProfile.bio
    };

    if (profileImageFile) {
      try {
        updatedProfile.profileImage = await fileToBase64(profileImageFile);
      } catch (error) {
        setModalMessage('Error processing profile image.');
        setShowModal(true);
        return;
      }
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL_USER}/user/update`, updatedProfile, {
        headers: { 'Content-Type': 'application/json' }
      });
      setUserProfile({
        username: response.data.username,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        bio: response.data.bio
      });
      if (profileImageFile) {
        const imageResponse = await axios.get(`${process.env.REACT_APP_API_URL_USER}/user/profile-image/${username}`, { responseType: 'blob' });
        setProfileImageUrl(URL.createObjectURL(imageResponse.data));
      }
      setEditProfile(null);
      setProfileImageFile(null);
      setModalMessage('Profile updated successfully!');
      setShowModal(true);
    } catch (error) {
      console.error('Error updating profile:', error.response || error.message);
      setModalMessage(error.response?.data || 'Failed to update profile.');
      setShowModal(true);
    }
  };

  return (
    <div className="page-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={10}>
            <h1 className="section-title text-center">Profile</h1>
            <p className="section-subtitle text-center">Welcome, {username}!</p>

            {/* User Profile Section */}
            <Card className="content-card mb-4">
              <Card.Body>
                <h3 className="section-title">About You</h3>
                {editProfile ? (
                  <Form onSubmit={handleUpdateProfile}>
                    <Form.Group className="mb-3" controlId="formUsername">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={editProfile.username}
                        disabled
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={editProfile.email}
                        onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formFirstName">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={editProfile.firstName}
                        onChange={(e) => setEditProfile({ ...editProfile, firstName: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formLastName">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={editProfile.lastName}
                        onChange={(e) => setEditProfile({ ...editProfile, lastName: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBio">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editProfile.bio}
                        onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formProfileImage">
                      <Form.Label>Profile Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileImageFile(e.target.files[0])}
                      />
                      {profileImageFile && <p className="mt-2">Selected: {profileImageFile.name}</p>}
                    </Form.Group>
                    <Button variant="primary" type="submit" className="me-2">
                      Save
                    </Button>
                    <Button variant="secondary" onClick={() => setEditProfile(null)}>
                      Cancel
                    </Button>
                  </Form>
                ) : (
                  <>
                    {profileImageUrl && (
                      <div className="text-center mb-3">
                        <Image
                          src={profileImageUrl}
                          alt="Profile"
                          roundedCircle
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Username:</strong> {userProfile.username}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Email:</strong> {userProfile.email}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>First Name:</strong> {userProfile.firstName}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Last Name:</strong> {userProfile.lastName}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Bio:</strong> {userProfile.bio || 'Not set yet'}
                      </ListGroup.Item>
                    </ListGroup>
                    <Button
                      variant="outline-primary"
                      className="mt-3"
                      onClick={() => setEditProfile({ ...userProfile })}
                    >
                      Edit Profile
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>

            {/* Stats Section */}
            <Card className="content-card mb-4">
              <Card.Body>
                <h3 className="section-title">Your Stats</h3>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    Total Ideas Posted: <Badge bg="primary">{userIdeas.length}</Badge>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    Total Comments Made: <Badge bg="primary">{userComments.length}</Badge>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    Total Likes Received: <Badge bg="primary">{totalLikes}</Badge>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Posted Ideas Section */}
            <Card className="content-card mb-4">
              <Card.Body>
                <h3 className="section-title">Your Ideas</h3>
                {userIdeas.length > 0 ? (
                  userIdeas.map(idea => (
                    <IdeaCard key={idea.title} idea={idea} />
                  ))
                ) : (
                  <p className="text-center">You haven't posted any ideas yet.</p>
                )}
              </Card.Body>
            </Card>

            {/* Comments Section */}
            <Card className="content-card">
              <Card.Body>
                <h3 className="section-title">Your Comments</h3>
                {userComments.length > 0 ? (
                  <ListGroup variant="flush">
                    {userComments.map((comment, index) => (
                      <ListGroup.Item key={index}>
                        <strong>On "{comment.ideaTitle}": </strong>{comment.content}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-center">You haven't made any comments yet.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Profile Update Status</Modal.Title>
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

export default Profile;