import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

if (typeof window !== 'undefined') {
  // Disable native alert/confirm popups globally.
  window.alert = () => {}
  window.confirm = () => true
}


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
