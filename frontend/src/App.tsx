import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import NewTicket from './pages/NewTicket';
import Analytics from './pages/Analytics';
import Agents from './pages/Agents';
import Clients from './pages/Clients';
import Profile from './pages/Profile';
import ProtectedRoute from './auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tickets" element={<TicketList />} />
              <Route path="/tickets/new" element={<NewTicket />} />
              <Route path="/tickets/edit/:id" element={<NewTicket />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/assigned" element={<TicketList />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </TicketProvider>
    </AuthProvider>
  );
}
