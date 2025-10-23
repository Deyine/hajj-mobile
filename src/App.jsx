import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import NewLogin from './pages/NewLogin'
import Callback from './pages/Callback'
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
        {/* Root route - redirect based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<NewLogin />} />
        <Route path="/cb" element={<Callback />} />

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
