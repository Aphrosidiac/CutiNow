import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLeaveRequests from './pages/admin/AdminLeaveRequests';
import AdminLeaveTypes from './pages/admin/AdminLeaveTypes';
import AdminEmployees from './pages/admin/AdminEmployees';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/apply-leave" element={
            <ProtectedRoute roles={['employee']}>
              <ApplyLeave />
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute roles={['employee']}>
              <History />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute roles={['admin']}>
              <AdminEmployees />
            </ProtectedRoute>
          } />
          <Route path="/admin/requests" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLeaveRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/types" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLeaveTypes />
            </ProtectedRoute>
          } />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
