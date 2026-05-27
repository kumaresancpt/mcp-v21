import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AllVisitors } from './pages/AllVisitors'
import { VisitorEntry } from './pages/VisitorEntry'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/visitors" element={<ProtectedRoute><AllVisitors /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute><AllVisitors /></ProtectedRoute>} />
        <Route path="/visitor-entry" element={<ProtectedRoute><VisitorEntry /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
