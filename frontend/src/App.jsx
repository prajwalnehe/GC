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
import Proposals from './pages/Proposals';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Payments from './pages/Payments';
import Users from './pages/Users';
import Settings from './pages/Settings';
import LoadingSpinner from './components/common/LoadingSpinner';

const TabPage = ({ tabId, adminOnly, children }) => (
  <ProtectedRoute tabId={tabId} adminOnly={adminOnly}>{children}</ProtectedRoute>
);

const App = () => {
  const { user, loading, getHomePath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={getHomePath()} /> : <Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={user ? <Navigate to={getHomePath()} /> : <ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<TabPage tabId="dashboard"><Dashboard /></TabPage>} />
        <Route path="/leads" element={<TabPage tabId="leads"><Leads /></TabPage>} />
        <Route path="/followup-leads" element={<TabPage tabId="followup-leads"><FollowupLeads /></TabPage>} />
        <Route path="/leads/:id" element={<TabPage tabId="leads"><LeadDetails /></TabPage>} />
        <Route path="/proposals" element={<TabPage tabId="proposals"><Proposals /></TabPage>} />
        <Route path="/clients" element={<TabPage tabId="clients"><Clients /></TabPage>} />
        <Route path="/projects" element={<TabPage tabId="projects"><Projects /></TabPage>} />
        <Route path="/payments" element={<TabPage tabId="payments"><Payments /></TabPage>} />
        <Route path="/users" element={<TabPage tabId="users" adminOnly><Users /></TabPage>} />
        <Route path="/settings" element={<TabPage tabId="settings"><Settings /></TabPage>} />
      </Route>

      <Route path="*" element={<Navigate to={user ? getHomePath() : '/login'} />} />
    </Routes>
  );
};

export default App;
