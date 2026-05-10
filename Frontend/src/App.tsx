// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Workspace from './pages/Workspace';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Onboarding from './pages/Onboarding';

/**
 * After Stripe checkout, the user is redirected to /billing/success.
 * We forward them to /upgrade?payment=success so the Subscription page
 * can display the success banner while still being a protected route.
 */
function BillingSuccessRedirect() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';
  return <Navigate to={`/upgrade?payment=success&session_id=${sessionId}`} replace />;
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* --- Stripe Billing Redirects --- */}
            <Route path="/billing/success" element={<BillingSuccessRedirect />} />
            <Route path="/billing/cancel" element={<Navigate to="/upgrade" replace />} />

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