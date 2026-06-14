import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import FollowupLeads from './pages/FollowupLeads';
import LeadDetails from './pages/LeadDetails';
import FollowUps from './pages/FollowUps';
import Proposals from './pages/Proposals';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Payments from './pages/Payments';
import Users from './pages/Users';
import Settings from './pages/Settings';
import LoadingSpinner from './components/common/LoadingSpinner';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/followup-leads" element={<FollowupLeads />} />
        <Route path="/leads/:id" element={<LeadDetails />} />
        <Route path="/follow-ups" element={<FollowUps />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
};

export default App;
