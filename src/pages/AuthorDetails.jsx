import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Image } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import IdeaCard from '../components/IdeaCard';
import '../styles/AuthStyles.css';

function AuthorDetails() {
  const { username } = useParams(); // Get username from URL
  const navigate = useNavigate();
  const [authorProfile, setAuthorProfile] = useState(null);
  const [authorIdeas, setAuthorIdeas] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        // Fetch author's profile (Port 8082)
        const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL_USER}/user/get/${username}`);
        setAuthorProfile(profileResponse.data);

        // Fetch author's profile image (Port 8082)
        const imageResponse = await axios.get(`${process.env.REACT_APP_API_URL_USER}/user/profile-image/${username}`, { responseType: 'blob' });
        setProfileImageUrl(URL.createObjectURL(imageResponse.data));

        // Fetch author's ideas (Port 8083)
        const ideasResponse = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/getAll/${username}`);
        setAuthorIdeas(Array.isArray(ideasResponse.data) ? ideasResponse.data : []);
      } catch (error) {
        console.error('Error fetching author data:', error.response || error.message);
      }
    };
    fetchAuthorData();
  }, [username]);

  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handleMessageClick = () => {
    // Navigate to Messages component with the recipient query parameter
    navigate(`/messages?recipient=${username}`);
  };

  return (
    <div className="page-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={10}>
            <h1 className="section-title text-center">Author Details</h1>
            <p className="section-subtitle text-center">{username}</p>

            {/* Author Profile Section */}
            {authorProfile && (
              <Card className="content-card mb-4">
                <Card.Body>
                  <h3 className="section-title">User Profile</h3>
                  {profileImageUrl && (
                    <div className="text-center mb-3">
                      <Image
                        src={profileImageUrl}
                        alt={`${username}'s profile`}
                        roundedCircle
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Username:</strong> {authorProfile.username}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Email:</strong> {authorProfile.email}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>First Name:</strong> {authorProfile.firstName}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Last Name:</strong> {authorProfile.lastName}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Bio:</strong> {authorProfile.bio || 'Not set yet'}
                    </ListGroup.Item>
                  </ListGroup>
                  {/* Message Button */}
                  <div className="text-center mt-3">
                    <Button variant="primary" onClick={handleMessageClick}>
                      Message
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Author's Ideas Section */}
            <Card className="content-card mb-4">
              <Card.Body>
                <h3 className="section-title">Ideas Posted by {username}</h3>
                {authorIdeas.length > 0 ? (
                  authorIdeas.map(idea => (
                    <IdeaCard key={idea.title} idea={idea} />
                  ))
                ) : (
                  <p className="text-center">This author hasn't posted any ideas yet.</p>
                )}
              </Card.Body>
            </Card>

            {/* Back Button */}
            <Button variant="secondary" onClick={handleBackClick} className="mb-4">
              Back
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AuthorDetails;