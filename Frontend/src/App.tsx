// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Workspace from './pages/Workspace';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* --- Onboarding (protected, but allowed before is_onboarded) --- */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* --- Protected Routes (requires auth + completed onboarding) --- */}
            <Route
              path="/workspace"
              element={
                <ProtectedRoute requireOnboarded>
                  <Workspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireOnboarded>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upgrade"
              element={
                <ProtectedRoute requireOnboarded>
                  <Subscription />
                </ProtectedRoute>
              }
            />

          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;