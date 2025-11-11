import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import AdDetailPage from './pages/AdDetailPage';
import AdFormPage from './pages/AdFormPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  useEffect(() => {
    const routes = ['/', '/ads/:id', '/create', '/ads/:id/edit', '/profile'];
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      try {
        window.handleRoutes(routes);
      } catch (e) {
        // no-op
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ads/:id" element={<AdDetailPage />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <AdFormPage mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ads/:id/edit"
            element={
              <ProtectedRoute>
                <AdFormPage mode="edit" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
