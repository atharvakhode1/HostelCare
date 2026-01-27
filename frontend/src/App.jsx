import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateIssue from './pages/CreateIssue';
import IssueDetail from './pages/IssueDetail';
import Announcements from './pages/Announcements';
import CreateAnnouncement from './pages/CreateAnnouncement';
import LostFound from './pages/LostFound';
import ReportItem from './pages/ReportItem';
import Analytics from './pages/Analytics';
import AssignIssue from './pages/AssignIssue';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-issue"
            element={
              <ProtectedRoute>
                <CreateIssue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issue/:id"
            element={
              <ProtectedRoute>
                <IssueDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <Announcements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-announcement"
            element={
              <ProtectedRoute>
                <CreateAnnouncement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost-found"
            element={
              <ProtectedRoute>
                <LostFound />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-item"
            element={
              <ProtectedRoute>
                <ReportItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
  path="/assign-issue/:id"
  element={
    <ProtectedRoute>
      <AssignIssue />
    </ProtectedRoute>
  }
/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;