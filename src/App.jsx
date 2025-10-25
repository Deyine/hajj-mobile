import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import NewLogin from './pages/NewLogin'
import Callback from './pages/Callback'
import Logout from './pages/Logout'
import NewDashboard from './pages/NewDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { isAuthenticated } from './utils/auth'

/**
 * Main App component with routing configuration
 * Updated to use shadcn/ui components
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Root route - redirect based on auth status or OAuth code */}
        <Route
          path="/"
          element={
            (() => {
              const params = new URLSearchParams(window.location.search)
              const code = params.get('code')

              // If OAuth code present (from backend redirect), let login handle it
              if (code) {
                return <Navigate to={`/login?code=${code}`} replace />
              }

              // Otherwise redirect based on auth status
              return isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            })()
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<NewLogin />} />
        {/*
          IMPORTANT: /cb is handled SERVER-SIDE by backend Rails (via nginx proxy)
          This frontend route is ONLY for when backend redirects back with ?debug= parameter
          The actual OAuth callback from Khidmaty NEVER reaches this route!
        */}
        <Route path="/cb" element={<Callback />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <NewDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
