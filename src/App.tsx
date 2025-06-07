import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Components
import OfflineAlert from './components/ui/OfflineAlert';
import InstallPWAButton from './components/ui/InstallPWAButton';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PatientsPage from './pages/patients/PatientsPage';
import PatientDetailsPage from './pages/patients/PatientDetailsPage';
import ExaminationPage from './pages/examinations/ExaminationPage';
import SOAPNotesPage from './pages/examinations/SOAPNotesPage';
import SchedulePage from './pages/schedule/SchedulePage';
import SettingsPage from './pages/settings/SettingsPage';
import AppointmentDetailsPage from './pages/appointments/AppointmentDetailsPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';

// Technician Pages
import CheckInQueuePage from './pages/technician/CheckInQueuePage';
import TestingQueuePage from './pages/technician/TestingQueuePage';
import PatientPreTestingPage from './pages/technician/PatientPreTestingPage';

// Protected route component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // The service worker is registered by vite-plugin-pwa
        console.log('Service worker is supported');
      });
    }
  }, []);

  return (
    <>
      <OfflineAlert />
      <InstallPWAButton />
      
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard\" replace />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:id" element={<PatientDetailsPage />} />
          <Route path="/patients/:id/examination" element={<ExaminationPage />} />
          <Route path="/patients/:id/soap" element={<SOAPNotesPage />} />
          <Route path="/patients/:id/pre-testing" element={<PatientPreTestingPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/check-in" element={<CheckInQueuePage />} />
          <Route path="/testing-queue" element={<TestingQueuePage />} />
        </Route>
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/\" replace />} />
      </Routes>
    </>
  );
}

export default App;