// require('dotenv').config({ path: '../custom.env' });

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Optional: Log environment variables to verify they’re loaded (remove in production)
console.log('REACT_APP_API_URL_USER:', process.env.REACT_APP_API_URL_USER);
console.log('REACT_APP_API_URL_COMMENT:', process.env.REACT_APP_API_URL_COMMENT);
console.log('REACT_APP_API_URL_IDEA:', process.env.REACT_APP_API_URL_IDEA);
console.log('REACT_APP_API_URL_MESSAGE:', process.env.REACT_APP_API_URL_MESSAGE);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
