import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import IdeaCard from '../components/IdeaCard';
import '../styles/AuthStyles.css';

function IdeaDetail() {
  const { username, title } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        setLoading(true);
        const decodedUsername = decodeURIComponent(username);
        const decodedTitle = decodeURIComponent(title);
        const response = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/getbyuser/${decodedUsername}/${decodedTitle}`);
        console.log('Fetched idea:', response.data);
        setIdea(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching idea:', error.response || error.message);
        setError('Idea not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchIdea();
  }, [username, title]);

  return (
    <div className="page-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <h1 className="section-title text-center">Idea Details</h1>
            {loading ? (
              <p className="text-center">Loading idea...</p>
            ) : error ? (
              <p className="text-center text-danger">{error}</p>
            ) : idea ? (
              <IdeaCard idea={idea} />
            ) : (
              <p className="text-center">Idea not found.</p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default IdeaDetail;