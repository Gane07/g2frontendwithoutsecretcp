import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, ListGroup, Image, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function IdeaCard({ idea }) {
  const [documentUrl, setDocumentUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [comments, setComments] = useState([]);
  const [authorProfileImageUrl, setAuthorProfileImageUrl] = useState('');
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();
  const currentUser = sessionStorage.getItem('username');

  useEffect(() => {
    const fetchFilesAndComments = async () => {
      try {
        // Fetch document
        if (idea.document) {
          const docResponse = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/document/${idea.id}`, {
            responseType: 'blob',
          }).catch(err => {
            console.error(`Error fetching document for idea ${idea.id}:`, err.response || err.message);
            return null; // Handle error gracefully
          });
          if (docResponse) {
            setDocumentUrl(URL.createObjectURL(docResponse.data));
          }
        }

        // Fetch image
        if (idea.image) {
          const imgResponse = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/image/${idea.id}`, {
            responseType: 'blob',
          }).catch(err => {
            console.error(`Error fetching image for idea ${idea.id}:`, err.response || err.message);
            return null; // Handle error gracefully
          });
          if (imgResponse) {
            setImageUrl(URL.createObjectURL(imgResponse.data));
          }
        }

        // Fetch comments
        const commentsResponse = await axios.get(`${process.env.REACT_APP_API_URL_COMMENT}/comments/idea/${idea.id}`);
        setComments(Array.isArray(commentsResponse.data) ? commentsResponse.data : []);

        // Fetch author profile image
        const profileImageResponse = await axios.get(`${process.env.REACT_APP_API_URL_USER}/user/profile-image/${idea.username}`, {
          responseType: 'blob',
        });
        setAuthorProfileImageUrl(URL.createObjectURL(profileImageResponse.data));
      } catch (error) {
        console.error('Error fetching data for IdeaCard:', error.response || error.message);
      }
    };
    fetchFilesAndComments();
  }, [idea.id, idea.document, idea.image, idea.username]);

  const openInNewWindow = (url, type) => {
    if (!url) return;
    const newWindow = window.open(url, '_blank', 'width=800,height=600');
    if (newWindow) newWindow.focus();
    else alert('Please allow popups for this site to view the file.');
  };

  const handleAuthorClick = () => {
    navigate(`/author/${idea.username}`);
  };

  const handleMessageClick = () => {
    if (!currentUser) {
      alert('Please log in to send a message.');
      return;
    }
    navigate(`/messages?recipient=${idea.username}`);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to post a comment.');
      return;
    }
    if (!newComment.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    const commentData = { ideaId: idea.id, commentUsername: currentUser, content: newComment };
    try {
      await axios.post(`${process.env.REACT_APP_API_URL_COMMENT}/comments/add`, commentData, {
        headers: { 'Content-Type': 'application/json' },
      });
      const commentsResponse = await axios.get(`${process.env.REACT_APP_API_URL_COMMENT}/comments/idea/${idea.id}`);
      setComments(Array.isArray(commentsResponse.data) ? commentsResponse.data : []);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error.response || error.message);
      alert('Failed to post comment. Please try again.');
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header className="idea-header d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          {authorProfileImageUrl && (
            <Image
              src={authorProfileImageUrl}
              alt={`${idea.username}'s profile`}
              roundedCircle
              style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
            />
          )}
          <div>
            <Card.Title className="idea-title">{idea.title}</Card.Title>
            <Card.Subtitle
              className="idea-author text-muted"
              style={{ cursor: 'pointer' }}
              onClick={handleAuthorClick}
            >
              Posted by {idea.username}
            </Card.Subtitle>
          </div>
        </div>
        <Button variant="outline-primary" size="sm" onClick={handleMessageClick}>
          Connect
        </Button>
      </Card.Header>
      <Card.Body>
        <Card.Text>{idea.description}</Card.Text>
        <div className="mt-2">
          {documentUrl ? (
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2"
              onClick={() => openInNewWindow(documentUrl, 'document')}
            >
              Document
            </Button>
          ) : (
            idea.document && <span className="text-muted">Document unavailable</span>
          )}
          {imageUrl ? (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => openInNewWindow(imageUrl, 'image')}
            >
              Image
            </Button>
          ) : (
            idea.image && <span className="text-muted">Image unavailable</span>
          )}
        </div>
        <Badge
          bg={
            idea.status === 'Completed'
              ? 'success'
              : idea.status === 'In Progress'
              ? 'warning'
              : idea.status === 'Abandoned'
              ? 'danger'
              : 'primary'
          }
          className="mt-2"
        >
          Status: {idea.status}
        </Badge>
        <div className="mt-3">
          <h5>Comments</h5>
          {comments.length > 0 ? (
            <ListGroup variant="flush">
              {comments.map((comment, index) => (
                <ListGroup.Item key={index}>
                  <strong>{comment.commentUsername}: </strong>
                  {comment.content}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No comments yet.</p>
          )}
          <Form onSubmit={handleCommentSubmit} className="mt-3">
            <Form.Group controlId="newComment">
              <Form.Control
                as="textarea"
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
            </Form.Group>
            <Button variant="primary" type="submit" size="sm" className="mt-2">
              Post Comment
            </Button>
          </Form>
        </div>
      </Card.Body>
    </Card>
  );
}

export default IdeaCard;