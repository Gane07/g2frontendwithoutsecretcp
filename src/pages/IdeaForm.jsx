import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, ListGroup, Badge, Dropdown } from 'react-bootstrap';
import { Share, PlusCircle, FileText, Image as ImageIcon } from 'react-bootstrap-icons';
import axios from 'axios';
import '../styles/AuthStyles.css';

function IdeaItem({ idea, onCardClick, onShare, onDelete, isSelected, comments, onUpdate }) {
  const [documentUrl, setDocumentUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editIdea, setEditIdea] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      if (idea.document) {
        const response = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/document/${idea.id}`, { responseType: 'blob' });
        const url = URL.createObjectURL(response.data);
        setDocumentUrl(url);
      }
      if (idea.image) {
        const response = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/image/${idea.id}`, { responseType: 'blob' });
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      }
    };
    fetchFiles();
  }, [idea.id, idea.document, idea.image]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const ideaData = {
      username: idea.username,
      title: editIdea.title,
      description: editIdea.description,
      status: editIdea.status
    };

    if (documentFile) {
      ideaData.document = await fileToBase64(documentFile);
    }
    if (imageFile) {
      ideaData.image = await fileToBase64(imageFile);
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_URL_IDEA}/ideas/update`, ideaData, {
        headers: { 'Content-Type': 'application/json' }
      });
      setEditIdea(null);
      setDocumentFile(null);
      setImageFile(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating idea:', error.response || error.message);
    }
  };

  const handleFileUpload = (type) => (e) => {
    const file = e.target.files[0];
    if (type === 'document') setDocumentFile(file);
    else if (type === 'image') setImageFile(file);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to open document or image in a new window
  const openInNewWindow = (url, type) => {
    if (!url) return;
    const newWindow = window.open(url, '_blank', 'width=800,height=600');
    if (newWindow) {
      newWindow.focus();
    } else {
      alert('Please allow popups for this site to view the file.');
    }
  };

  return (
    <Card className="content-card mt-3" onClick={() => onCardClick(idea)} style={{ cursor: 'pointer' }}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="idea-title">{idea.title}</Card.Title>
        <Share size={20} onClick={(e) => { e.stopPropagation(); onShare(idea); }} style={{ cursor: 'pointer', color: '#17a2b8' }} title="Share this idea" />
      </Card.Header>
      <Card.Body>
        {editIdea ? (
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={editIdea.title} onChange={(e) => setEditIdea({ ...editIdea, title: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={editIdea.description} onChange={(e) => setEditIdea({ ...editIdea, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select value={editIdea.status} onChange={(e) => setEditIdea({ ...editIdea, status: e.target.value })}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Abandoned">Abandoned</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Dropdown>
                <Dropdown.Toggle as="div" style={{ cursor: 'pointer' }}>
                  <PlusCircle size={24} color="#17a2b8" title="Add Document or Image" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as="label" style={{ cursor: 'pointer' }}>
                    <FileText className="me-2" /> Document
                    <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileUpload('document')} />
                  </Dropdown.Item>
                  <Dropdown.Item as="label" style={{ cursor: 'pointer' }}>
                    <ImageIcon className="me-2" /> Image
                    <input type="file" hidden accept="image/*" onChange={handleFileUpload('image')} />
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              {documentFile && <p className="mt-2">Document: {documentFile.name}</p>}
              {imageFile && <p className="mt-2">Image: {imageFile.name}</p>}
            </Form.Group>
            <Button variant="primary" type="submit" className="me-2">Save</Button>
            <Button variant="secondary" onClick={() => setEditIdea(null)}>Cancel</Button>
          </Form>
        ) : (
          <>
            <Card.Text className="section-subtitle">{idea.description}</Card.Text>
            <div className="mt-2">
              {documentUrl && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInNewWindow(documentUrl, 'document');
                  }}
                >
                  Document
                </Button>
              )}
              {imageUrl && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInNewWindow(imageUrl, 'image');
                  }}
                >
                  Image
                </Button>
              )}
            </div>
            <Badge bg={idea.status === 'Completed' ? 'success' : idea.status === 'In Progress' ? 'warning' : idea.status === 'Abandoned' ? 'danger' : 'primary'}>
              Status: {idea.status}
            </Badge>
            <div className="mt-2">
              <Button variant="outline-primary" className="me-2" onClick={(e) => { e.stopPropagation(); setEditIdea(idea); }}>Update</Button>
              <Button variant="outline-danger" onClick={(e) => { e.stopPropagation(); onDelete(idea.title); }}>Delete</Button>
            </div>
          </>
        )}
        {isSelected && (
          <div className="mt-3">
            <h5 className="section-title">Suggestions</h5>
            {comments.length > 0 ? (
              <ListGroup variant="flush">
                {comments.map((comment, index) => (
                  <ListGroup.Item key={index}><strong>{comment.commentUsername}: </strong>{comment.content}</ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p>No suggestions yet.</p>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function IdeaForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Open');
  const [documentFile, setDocumentFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [userIdeas, setUserIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [comments, setComments] = useState([]);
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    const fetchUserIdeas = async () => {
      if (!username) {
        setModalMessage('Please log in to view your ideas.');
        setShowModal(true);
        return;
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/getAll/${username}`);
        setUserIdeas(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching user ideas:', error.message, error.response);
        setModalMessage(error.response?.data || 'Failed to fetch your ideas.');
        setShowModal(true);
      }
    };
    fetchUserIdeas();
  }, [username]);

  useEffect(() => {
    const fetchComments = async () => {
      if (selectedIdea) {
        try {
          const ideaResponse = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/getbyuser/${username}/${selectedIdea.title}`);
          const ideaId = ideaResponse.data.id;
          const response = await axios.get(`${process.env.REACT_APP_API_URL_COMMENT}/comments/idea/${ideaId}`);
          setComments(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      }
    };
    fetchComments();
  }, [selectedIdea, username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setModalMessage('Please log in to post an idea.');
      setShowModal(true);
      return;
    }

    const ideaData = {
      username,
      title,
      description,
      status
    };

    if (documentFile) {
      ideaData.document = await fileToBase64(documentFile);
    }
    if (imageFile) {
      ideaData.image = await fileToBase64(imageFile);
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL_IDEA}/ideas/add`, ideaData, {
        headers: { 'Content-Type': 'application/json' }
      });
      setModalMessage('Idea posted successfully!');
      setShowModal(true);
      setTitle('');
      setDescription('');
      setStatus('Open');
      setDocumentFile(null);
      setImageFile(null);
      const updatedIdeasResponse = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/getAll/${username}`);
      setUserIdeas(Array.isArray(updatedIdeasResponse.data) ? updatedIdeasResponse.data : []);
    } catch (error) {
      console.error('Error posting idea:', error.response || error.message);
      setModalMessage(error.response?.data || 'Failed to post idea.');
      setShowModal(true);
    }
  };

  const handleDelete = async (title) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL_IDEA}/ideas/delete/${username}/${title}`);
      setModalMessage('Idea deleted successfully!');
      setShowModal(true);
      const updatedIdeasResponse = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/getAll/${username}`);
      setUserIdeas(Array.isArray(updatedIdeasResponse.data) ? updatedIdeasResponse.data : []);
      if (selectedIdea && selectedIdea.title === title) setSelectedIdea(null);
    } catch (error) {
      console.error('Error deleting idea:', error.response || error.message);
      setModalMessage(error.response?.data || 'Failed to delete idea.');
      setShowModal(true);
    }
  };

  const handleCardClick = (idea) => {
    setSelectedIdea(selectedIdea?.title === idea.title ? null : idea);
  };

  const handleShare = async (idea) => {
    const shareUrl = `${window.location.origin}/idea/${encodeURIComponent(idea.username)}/${encodeURIComponent(idea.title)}`;
    const shareData = {
      title: `Check out this idea: ${idea.title}`,
      text: `${idea.description}\n\nStatus: ${idea.status}`,
      url: shareUrl
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setModalMessage('Link copied to clipboard!');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error sharing idea:', error);
      await navigator.clipboard.writeText(shareUrl);
      setModalMessage('Link copied to clipboard! (Sharing not supported)');
      setShowModal(true);
    }
  };

  const handleUpdateSuccess = async () => {
    const updatedIdeasResponse = await axios.get(`${process.env.REACT_APP_API_URL_IDEA}/ideas/getAll/${username}`);
    setUserIdeas(Array.isArray(updatedIdeasResponse.data) ? updatedIdeasResponse.data : []);
    setModalMessage('Idea updated successfully!');
    setShowModal(true);
  };

  const handleFileUpload = (type) => (e) => {
    const file = e.target.files[0];
    if (type === 'document') setDocumentFile(file);
    else if (type === 'image') setImageFile(file);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="page-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="content-card">
              <Card.Body>
                <h2 className="section-title text-center">Share Your Idea</h2>
                <Form onSubmit={handleSubmit} className="auth-form">
                  <Form.Group className="mb-3" controlId="formTitle">
                    <Form.Label>Idea Title</Form.Label>
                    <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your idea title" required />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your startup idea..." required />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Abandoned">Abandoned</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Dropdown>
                      <Dropdown.Toggle as="div" style={{ cursor: 'pointer' }}>
                        <PlusCircle size={24} color="#17a2b8" title="Add Document or Image" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as="label" style={{ cursor: 'pointer' }}>
                          <FileText className="me-2" /> Document
                          <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileUpload('document')} />
                        </Dropdown.Item>
                        <Dropdown.Item as="label" style={{ cursor: 'pointer' }}>
                          <ImageIcon className="me-2" /> Image
                          <input type="file" hidden accept="image/*" onChange={handleFileUpload('image')} />
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    {documentFile && <p className="mt-2">Document: {documentFile.name}</p>}
                    {imageFile && <p className="mt-2">Image: {imageFile.name}</p>}
                  </Form.Group>
                  <Button variant="primary" type="submit" className="auth-button w-100">Post Idea</Button>
                </Form>
              </Card.Body>
            </Card>

            <h3 className="section-title mt-4">Your Posted Ideas</h3>
            {userIdeas.length > 0 ? (
              userIdeas.map((idea) => (
                <IdeaItem
                  key={idea.title}
                  idea={idea}
                  onCardClick={handleCardClick}
                  onShare={handleShare}
                  onDelete={handleDelete}
                  onUpdate={handleUpdateSuccess}
                  isSelected={selectedIdea && selectedIdea.title === idea.title}
                  comments={comments}
                />
              ))
            ) : (
              <p className="text-center mt-3">You haven't posted any ideas yet.</p>
            )}
          </Col>
        </Row>
      </Container>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Idea Submission Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default IdeaForm;