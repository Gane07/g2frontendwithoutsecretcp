import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import IdeaCard from '../components/IdeaCard';
import axios from 'axios';
import '../styles/AuthStyles.css';

function Explore() {
  const [ideas, setIdeas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    const fetchIdeas = async () => {
      if (!username) {
        console.log('No username found in sessionStorage. Please log in.');
        return;
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/exceptuser/${username}`);
        console.log('Fetched ideas:', response.data);
        const fetchedIdeas = Array.isArray(response.data) ? response.data : [];
        fetchedIdeas.forEach(idea => {
          console.log(`Idea - Title: ${idea.title}, Username: ${idea.username}`);
          if (/[^\x00-\xFF]/.test(idea.title) || /[^\x00-\xFF]/.test(idea.username)) {
            console.warn(`Non-ASCII character found in idea: ${JSON.stringify(idea)}`);
          }
        });
        setIdeas(fetchedIdeas.map(idea => ({ ...idea, comments: [] })));
      } catch (error) {
        console.error('Error fetching ideas:', error.response || error.message);
      }
    };
    fetchIdeas();
  }, [username]);

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <Container>
        <Row>
          <Col>
            <h1 className="section-title text-center">Explore Ideas</h1>
            <p className="section-subtitle text-center">
              Browse startup ideas and share your suggestions!
            </p>
            <Form className="mb-4">
              <Form.Group controlId="searchIdeas">
                <Form.Control
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="auth-form"
                />
              </Form.Group>
            </Form>
            {filteredIdeas.length > 0 ? (
              filteredIdeas.map(idea => (
                <IdeaCard key={idea.title} idea={idea} />
              ))
            ) : (
              <p className="text-center">No ideas match your search.</p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Explore;