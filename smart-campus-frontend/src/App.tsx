import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TicketListPage from './pages/TicketListPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import ResourceListPage from './pages/ResourceListPage';
import CreateResourcePage from './pages/CreateResourcePage';
import EditResourcePage from './pages/EditResourcePage';
import ProfilePage from './pages/ProfilePage';
import UserManagementPage from './pages/UserManagementPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import type { Role } from './types/auth.types';
import CreateBookingPage from './pages/CreateBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import EditBookingPage from './pages/EditBookingPage';
import AdminBookingsPage from './pages/AdminBookingsPage';

// Redirects unauthenticated users to /login
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Redirects already-logged-in users away from /login
function GuestRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function RoleRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/dashboard" replace />;
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

      {/* Guest-only (redirect to dashboard if already logged in) */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected — must be authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tickets" element={<TicketListPage />} />
          <Route path="tickets/create" element={<CreateTicketPage />} />
          <Route path="tickets/:id" element={<TicketDetailsPage />} />
          <Route path="resources" element={<ResourceListPage />} />
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="resources/create" element={<CreateResourcePage />} />
          </Route>
          <Route path="resources/edit/:id" element={<EditResourcePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="users" element={<UserManagementPage />} />
          </Route>
          <Route path="bookings/new" element={<CreateBookingPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailsPage />} />
          <Route path="bookings/:id/edit" element={<EditBookingPage />} />
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="admin/bookings" element={<AdminBookingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    // AuthProvider must live inside BrowserRouter so it can call useNavigate
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
