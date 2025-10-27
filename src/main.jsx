import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { preventPullToRefresh } from './utils/preventPullToRefresh'

// Prevent pull-to-refresh in WebView
preventPullToRefresh()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
