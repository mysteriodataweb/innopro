import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import $ from 'jquery';
import App from './App';
import { AuthProvider } from './store/auth';
import './styles/global.css';

// Make jQuery globally available for Luckysheet
window.$ = $;
window.jQuery = $;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { fontFamily:'DM Sans,sans-serif', fontSize:'14px', borderRadius:'12px' },
          success: { style: { background:'#1B4332', color:'#fff' } },
          error:   { style: { background:'#DC2626', color:'#fff' } },
        }}/>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
