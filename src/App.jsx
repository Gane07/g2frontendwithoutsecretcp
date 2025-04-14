import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import IdeaDetail from './pages/IdeaDetail';
import AuthorDetails from './pages/AuthorDetails';
import Messages from './pages/Messages';

// Lazy load protected components
const Explore = lazy(() => import('./pages/Explore'));
const IdeaForm = lazy(() => import('./pages/IdeaForm'));

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route 
              path="/explore" 
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post-idea" 
              element={
                <ProtectedRoute>
                  <IdeaForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/author/:username" 
              element={
                <ProtectedRoute>
                  <AuthorDetails/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/idea/:username/:title" 
              element={
                <ProtectedRoute>
                  <IdeaDetail />
                </ProtectedRoute>
                } 
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;