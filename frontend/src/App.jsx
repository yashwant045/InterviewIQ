import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import LiveInterview from './pages/LiveInterview';
import InterviewReport from './pages/InterviewReport';
import ConfigureInterview from './pages/ConfigureInterview';
import Profile from './pages/Profile';
import InterviewHistory from './pages/InterviewHistory';
import PracticeHub from './pages/PracticeHub';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center text-purple-400">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Immersive Live Interview Room (full screen with custom top bar) */}
          <Route
            path="/interview/:id"
            element={
              <ProtectedRoute>
                <div className="p-4 bg-[#090b10] min-h-screen">
                  <LiveInterview />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Standard Dashboard Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="configure" element={<ConfigureInterview />} />
            <Route path="report/:id" element={<InterviewReport />} />
            <Route path="history" element={<InterviewHistory />} />
            <Route path="practice" element={<PracticeHub />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
