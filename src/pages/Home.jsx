import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AuthStyles.css';

function Home() {
  const isLoggedIn = !!sessionStorage.getItem('username');
  const navigate = useNavigate();

  const handleShareIdeaClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/login', { state: { from: '/post-idea' } });
    }
    // If logged in, the default Link behavior will proceed to /ideaform
  };

  const handleExploreIdeasClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/login', { state: { from: '/explore' } });
    }
    // If logged in, the default Link behavior will proceed to /explore
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <Container className="text-center">
        <Row className="justify-content-center py-5">
          <Col md={8}>
            <h1 className="section-title mb-4">Welcome to Connected</h1>
            <p className="section-subtitle lead mb-4">
              Transform your startup ideas into reality with community feedback and expert suggestions
            </p>
            <Button 
              as={Link} 
              to={isLoggedIn ? "/post-idea" : "/login"} 
              onClick={handleShareIdeaClick}
              variant="primary" 
              size="lg" 
              className="cta-button me-2"
            >
              Share Your Idea
            </Button>
            <Button 
              as={Link} 
              to={isLoggedIn ? "/explore" : "/login"} 
              onClick={handleExploreIdeasClick}
              variant="outline-primary" 
              size="lg" 
              className="cta-button"
            >
              Explore Ideas
            </Button>
          </Col>
        </Row>
      </Container>

      {/* About Section */}
      <Container className="py-5">
        <Row className="align-items-center">
          <Col md={6}>
            <h2 className="section-title">About Connected</h2>
            <p className="section-subtitle">
            Connected is a dynamic platform designed to bring innovators together, allowing individuals to share their ideas and collaborate with like-minded professionals.
            </p>
            <p className="section-subtitle">
              Whether you're just starting out or looking to improve an existing idea, our platform 
              provides the perfect space for feedback and growth.
            </p>
          </Col>
          <Col md={6}>
            <Card className="content-card">
              <Card.Body>
                <h4 className="section-title">Our Services</h4>
                <ul className="list-unstyled mt-3 section-subtitle">
                  <li className="mb-2">✓ Share startup ideas securely</li>
                  <li className="mb-2">✓ Get constructive feedback</li>
                  <li className="mb-2">✓ Connect with other entrepreneurs</li>
                  <li className="mb-2">✓ Improve your concepts</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Conditional CTA or Advantages Section */}
      <Container className="py-5 text-center bg-primary text-white">
        <Row>
          <Col>
            {isLoggedIn ? (
              <>
                <h2 className="section-title mb-4">Why Connected?</h2>
                <p className="section-subtitle mb-4">Discover the advantages of being part of our community.</p>
                <Row className="justify-content-center">
                  <Col md={4} className="mb-3">
                    <Card className="h-100 bg-light text-dark">
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <h5 className="mb-3">Community Feedback</h5>
                          <p>Gain insights and suggestions from a diverse group of innovators.</p>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Card className="h-100 bg-light text-dark">
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <h5 className="mb-3">Visibility</h5>
                          <p>Share your ideas with a wide audience to attract collaborators.</p>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Card className="h-100 bg-light text-dark">
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <h5 className="mb-3">Growth Opportunities</h5>
                          <p>Refine your ideas with expert input and turn them into actionable plans.</p>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <h2 className="section-title mb-4">Ready to Get Started?</h2>
                <p className="section-subtitle mb-4">Join our community and start sharing your ideas today!</p>
                <Button as={Link} to="/login" variant="light" size="lg" className="cta-button">
                  Get Started
                </Button>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;