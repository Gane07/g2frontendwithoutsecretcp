import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button, Image } from 'react-bootstrap';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useLocation } from 'react-router-dom';
import '../styles/AuthStyles.css';

function Messages() {
  const currentUser = sessionStorage.getItem('username') || 'currentUser';
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, user: null });
  const [messageContextMenu, setMessageContextMenu] = useState({ show: false, x: 0, y: 0, message: null });
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const location = useLocation();
  const typingTimeoutRef = React.useRef(null); // For debouncing typing events

  const updateUsersList = (newUser) => {
    if (newUser && newUser !== currentUser) {
      setUsers(prev => {
        const uniqueUsers = new Set(prev);
        uniqueUsers.add(newUser);
        return Array.from(uniqueUsers);
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recipient = params.get('recipient');
    if (recipient && recipient !== currentUser) {
      setSelectedUser(recipient);
      updateUsersList(recipient);
    }

    const socket = new SockJS(`${process.env.REACT_APP_API_URL_MESSAGE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log('STOMP Debug:', str),
      onConnect: () => {
        console.log('WebSocket connected successfully for user:', currentUser);
        setIsConnected(true);
        setConnectionError(null);
        client.subscribe(`/topic/${currentUser}`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          console.log(`Received WebSocket message for ${currentUser}:`, newMsg);
          setMessages(prev => {
            const updatedMessages = prev.filter(m => 
              m.id ? m.id !== newMsg.id : (m.timestamp !== newMsg.timestamp || m.content !== newMsg.content)
            );
            console.log('Updated messages after WebSocket update:', [...updatedMessages, newMsg]);
            setIsTyping(false); // Clear typing indicator when a message is received
            console.log(`Cleared typing indicator for ${currentUser} because a message was received`);
            return [...updatedMessages, newMsg];
          });
          updateUsersList(newMsg.fromUser === currentUser ? newMsg.toUser : newMsg.fromUser);
        });
        client.subscribe(`/topic/typing/${currentUser}`, (msg) => {
          const event = JSON.parse(msg.body);
          console.log('Typing event received for user:', currentUser, event);
          if (event.fromUser === selectedUser) {
            setIsTyping(event.isTyping);
            console.log(`Set isTyping to ${event.isTyping} for ${currentUser} from ${selectedUser}`);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        setIsConnected(false);
        setConnectionError('Failed to connect: ' + frame.body);
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setConnectionError('WebSocket connection closed');
      },
      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
        setIsConnected(false);
        setConnectionError('WebSocket error: ' + error.message);
      },
    });

    console.log('Attempting to connect to WebSocket...');
    client.activate();
    setStompClient(client);

    axios.get(`${process.env.REACT_APP_API_URL_MESSAGE}/api/messages/conversations/${currentUser}`)
      .then(response => {
        console.log('Fetched conversation partners:', response.data);
        const uniqueUsers = Array.from(new Set(response.data.filter(u => u !== currentUser)));
        setUsers(uniqueUsers);
      })
      .catch(error => {
        console.error('Error fetching conversations:', error.response || error.message);
        const filteredUsers = ['user1', 'user2', 'Ganesh', 'Varun'].filter(u => u !== currentUser);
        const uniqueUsers = Array.from(new Set(filteredUsers));
        setUsers(uniqueUsers);
      });

    axios.get(`${process.env.REACT_APP_API_URL_USER}/user/getall`)
      .then(response => {
        console.log('Fetched all users:', response.data);
        const uniqueUsers = Array.from(new Set(response.data.map(user => user.username).filter(u => u !== currentUser)));
        setAllUsers(uniqueUsers);
      })
      .catch(error => {
        console.error('Error fetching all users:', error.response || error.message);
        const filteredUsers = ['user1', 'user2', 'Ganesh', 'Varun', 'Ajay', 'Bhargav'].filter(u => u !== currentUser);
        const uniqueUsers = Array.from(new Set(filteredUsers));
        setAllUsers(uniqueUsers);
      });

    return () => {
      if (client) client.deactivate();
      console.log('WebSocket client deactivated');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [currentUser, location.search]);

  useEffect(() => {
    if (selectedUser) {
      axios.get(`${process.env.REACT_APP_API_URL_USER}/user/get/${selectedUser}`)
        .then(response => {
          console.log('Fetched user profile:', response.data);
          const profileData = response.data;
          axios.get(`${process.env.REACT_APP_API_URL_USER}/user/profile-image/${selectedUser}`, { responseType: 'blob' })
            .then(imageResponse => {
              const imageUrl = URL.createObjectURL(imageResponse.data);
              setSelectedUserProfile({
                username: profileData.username,
                bio: profileData.bio || 'No bio available',
                profilePicture: imageUrl,
              });
            })
            .catch(error => {
              console.error('Error fetching profile image:', error.response?.data || error.message);
              setSelectedUserProfile({
                username: profileData.username,
                bio: profileData.bio || 'No bio available',
                profilePicture: 'https://via.placeholder.com/50',
              });
            });
        })
        .catch(error => {
          console.error('Error fetching user profile:', error.response?.data || error.message);
          setSelectedUserProfile({
            username: selectedUser,
            bio: 'No bio available',
            profilePicture: 'https://via.placeholder.com/50',
          });
        });
    } else {
      setSelectedUserProfile(null);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser && stompClient && isConnected) {
      console.log(`Fetching messages for ${currentUser} with ${selectedUser}`);
      axios.get(`${process.env.REACT_APP_API_URL_MESSAGE}/api/messages/${currentUser}?withUser=${selectedUser}`)
        .then(response => {
          console.log('Fetched messages:', response.data);
          setMessages(response.data || []);
          response.data.forEach(msg => {
            updateUsersList(msg.fromUser === currentUser ? msg.toUser : msg.fromUser);
          });
          console.log(`Calling /read endpoint for ${currentUser} to mark messages from ${selectedUser} as read`);
          axios.post(`${process.env.REACT_APP_API_URL_MESSAGE}/api/messages/read/${currentUser}/${selectedUser}`)
            .then(response => {
              console.log('Messages marked as read - Response:', response.data);
            })
            .catch(error => {
              console.error('Error marking messages as read:', error.response?.data || error.message);
            });
        })
        .catch(error => {
          console.error('Error fetching messages:', error.response || error.message);
          setMessages([]);
        });
    }
  }, [selectedUser, currentUser, stompClient, isConnected]);

  const sendTypingEvent = (isTyping) => {
    if (stompClient && isConnected && selectedUser) {
      const typingEvent = {
        fromUser: currentUser,
        toUser: selectedUser,
        isTyping: isTyping,
      };
      console.log('Sending typing event:', typingEvent);
      stompClient.publish({
        destination: '/app/typing',
        body: JSON.stringify(typingEvent),
      });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!stompClient || !isConnected || !selectedUser) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send isTyping: true immediately
    if (e.target.value.length > 0) {
      sendTypingEvent(true);
    }

    // Set a timeout to send isTyping: false if the user stops typing for 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (e.target.value.length === 0) {
        sendTypingEvent(false);
      }
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) {
      alert('Please select a user and enter a message.');
      return;
    }
    if (!stompClient || !isConnected) {
      alert('Messaging service is not connected. Please wait or refresh.');
      return;
    }

    const message = {
      fromUser: currentUser,
      toUser: selectedUser,
      content: newMessage,
      timestamp: new Date().toISOString(),
      reading: false,
      pinned: false,
    };

    console.log('Sending message:', message);
    stompClient.publish({ destination: '/app/send', body: JSON.stringify(message) });

    // Clear typing indicator and send isTyping: false
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingEvent(false);

    setNewMessage('');
    updateUsersList(selectedUser);
  };

  const handlePinMessage = (messageId) => {
    console.log(`Pinning message with ID: ${messageId}`);
    axios.post(`${process.env.REACT_APP_API_URL_MESSAGE}/api/messages/pin/${messageId}`)
      .then(response => {
        console.log('Message pinned:', response.data);
        setMessageContextMenu({ show: false, x: 0, y: 0, message: null });
      })
      .catch(error => {
        console.error('Error pinning message:', error.response?.data || error.message);
      });
  };

  const handleUnpinMessage = (messageId) => {
    console.log(`${process.env.REACT_APP_API_URL_MESSAGE}/api/messages/unpin/${messageId}`)
      .then(response => {
        console.log('Message unpinned:', response.data);
        setMessageContextMenu({ show: false, x: 0, y: 0, message: null });
      })
      .catch(error => {
        console.error('Error unpinning message:', error.response?.data || error.message);
      });
  };

  const handleMessageClick = (e, message) => {
    e.stopPropagation();
    console.log('Message clicked:', message);
    console.log('Showing message context menu at position:', { x: e.pageX, y: e.pageY });
    setMessageContextMenu({ show: true, x: e.pageX, y: e.pageY, message });
  };

  const handleContextMenu = (e, user) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.pageX, y: e.pageY, user });
  };

  const handleDeleteConversation = (user) => {
    axios.get(`${process.env.REACT_APP_API_URL_MESSAGE}/api/messages/${currentUser}?withUser=${user}`)
      .then(response => {
        if (response.data.length > 0) {
          axios.delete(`${process.env.REACT_APP_API_URL_MESSAGE}/api/messages/conversation/${currentUser}/${user}`)
            .then(() => {
              console.log(`Backend conversation with ${user} deleted`);
              setUsers(prev => prev.filter(u => u !== user));
              if (selectedUser === user) {
                setSelectedUser(null);
                setMessages([]);
              }
            })
            .catch(error => {
              console.error('Error deleting backend conversation:', error.response?.data || error.message);
              alert('Failed to delete conversation: ' + (error.response?.data || error.message));
            });
        } else {
          console.log(`No conversation with ${user}, removing from list`);
          setUsers(prev => prev.filter(u => u !== user));
          if (selectedUser === user) {
            setSelectedUser(null);
            setMessages([]);
          }
        }
      })
      .catch(error => {
        console.error('Error checking conversation:', error.response?.data || error.message);
        setUsers(prev => prev.filter(u => u !== user));
        if (selectedUser === user) {
          setSelectedUser(null);
          setMessages([]);
        }
      });
    setContextMenu({ show: false, x: 0, y: 0, user: null });
  };

  const filteredUsers = allUsers.filter(user =>
    user.toLowerCase().includes(filter.toLowerCase())
  );

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleFilterSelect = (user) => {
    updateUsersList(user);
    setSelectedUser(user);
    setFilter('');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      console.log('Click outside detected, closing context menus');
      setContextMenu({ show: false, x: 0, y: 0, user: null });
      setMessageContextMenu({ show: false, x: 0, y: 0, message: null });
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const groupMessagesByDate = (messages) => {
    const grouped = [];
    let currentDate = null;

    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (msgDate !== currentDate) {
        grouped.push({ type: 'date', value: msgDate });
        currentDate = msgDate;
      }
      grouped.push({ type: 'message', value: msg, index });
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="page-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={10}>
            <h1 className="section-title text-center">Messages</h1>
            <p className="section-subtitle text-center">Welcome, {currentUser}!</p>
            {!isConnected && (
              <p className="text-center text-warning">
                {connectionError || 'Connecting to messaging service...'}
              </p>
            )}

            <Card className="content-card">
              <Card.Body>
                <Row>
                  <Col md={4} className="border-end">
                    <h5 className="section-title">Conversations</h5>
                    <Form.Group controlId="filter" className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Filter users..."
                        value={filter}
                        onChange={handleFilterChange}
                      />
                      {filter && (
                        <ListGroup className="position-absolute" style={{ zIndex: 1000 }}>
                          {filteredUsers.map(user => (
                            <ListGroup.Item
                              key={user}
                              action
                              onClick={() => handleFilterSelect(user)}
                            >
                              {user}
                            </ListGroup.Item>
                          ))}
                          {filteredUsers.length === 0 && (
                            <ListGroup.Item>No users found</ListGroup.Item>
                          )}
                        </ListGroup>
                      )}
                    </Form.Group>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <ListGroup variant="flush">
                        {users.map(user => (
                          <ListGroup.Item
                            key={user}
                            action
                            active={selectedUser === user}
                            onClick={() => setSelectedUser(user)}
                            onContextMenu={(e) => handleContextMenu(e, user)}
                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            {user}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(user);
                              }}
                              style={{ cursor: 'pointer', color: 'red' }}
                            >
                              ✕
                            </span>
                          </ListGroup.Item>
                        ))}
                        {users.length === 0 && <p>No conversations yet.</p>}
                      </ListGroup>
                    </div>
                  </Col>

                  <Col md={8}>
                    {selectedUser ? (
                      <>
                        {selectedUserProfile && (
                          <div className="d-flex align-items-center mb-3 border-bottom pb-2">
                            <Image
                              src={selectedUserProfile.profilePicture}
                              roundedCircle
                              style={{ width: '50px', height: '50px', marginRight: '10px' }}
                            />
                            <div>
                              <h5 className="mb-0">{selectedUserProfile.username}</h5>
                              <p className="text-muted mb-0" style={{ fontSize: '0.9em' }}>
                                {selectedUserProfile.bio}
                              </p>
                            </div>
                          </div>
                        )}

                        {isTyping && (
                          <p className="text-muted" style={{ fontStyle: 'italic' }}>
                            ...
                          </p>
                        )}
                        <div
                          style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            padding: '10px',
                            marginBottom: '20px',
                          }}
                        >
                          {groupedMessages.length > 0 ? (
                            groupedMessages.map((item, idx) => (
                              <div key={idx}>
                                {item.type === 'date' ? (
                                  <div className="text-center my-2">
                                    <small className="text-muted bg-light px-2 py-1 rounded">
                                      {item.value}
                                    </small>
                                  </div>
                                ) : (
                                  <div
                                    className={`mb-2 ${item.value.fromUser === currentUser ? 'text-end' : 'text-start'}`}
                                    style={{ position: 'relative' }}
                                  >
                                    <p
                                      onClick={(e) => handleMessageClick(e, item.value)}
                                      style={{
                                        display: 'inline-block',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        backgroundColor: item.value.fromUser === currentUser ? '#007bff' : '#f1f1f1',
                                        color: item.value.fromUser === currentUser ? 'white' : 'black',
                                        maxWidth: '70%',
                                        border: item.value.pinned ? '2px solid #ffd700' : 'none',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {item.value.content}
                                      {item.value.fromUser === currentUser && (
                                        <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>
                                          {console.log(`Message ${item.value.id || item.index} read status:`, item.value.reading)}
                                          {item.value.reading ? (
                                            <span style={{ color: '#34b7f1' }}>✓✓</span>
                                          ) : (
                                            <span style={{ color: '#000' }}>✓</span>
                                          )}
                                        </span>
                                      )}
                                    </p>
                                    <small className="d-block text-muted">
                                      {new Date(item.value.timestamp).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true,
                                      })}
                                    </small>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p>No messages yet.</p>
                          )}
                        </div>
                        <Form onSubmit={handleSendMessage}>
                          <Form.Group controlId="newMessage" className="d-flex">
                            <Form.Control
                              type="text"
                              value={newMessage}
                              onChange={handleTyping}
                              placeholder="Write a message..."
                              className="me-2"
                              disabled={!isConnected}
                            />
                            <Button variant="primary" type="submit" disabled={!isConnected}>
                              Send
                            </Button>
                          </Form.Group>
                        </Form>
                      </>
                    ) : (
                      <p className="text-center mt-5">Select a user to start chatting</p>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {contextMenu.show && (
        <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '5px',
            zIndex: 1000,
          }}
        >
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteConversation(contextMenu.user)}
          >
            Remove from List
          </Button>
        </div>
      )}

      {messageContextMenu.show && (
        <div
          style={{
            position: 'absolute',
            top: messageContextMenu.y,
            left: messageContextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '5px',
            zIndex: 1000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          {messageContextMenu.message.pinned ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleUnpinMessage(messageContextMenu.message.id);
              }}
            >
              Unpin
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePinMessage(messageContextMenu.message.id);
              }}
            >
              Pin
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default Messages;