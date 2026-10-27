import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { RequestsFeed } from './pages/RequestsFeed';
import { CreateRequest } from './pages/CreateRequest';
import { RequestDetails } from './pages/RequestDetails';
import { MyRequests } from './pages/MyRequests';
import { DonorAlerts } from './pages/DonorAlerts';
import { DonorProfile } from './pages/DonorProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/requests" element={<RequestsFeed />} />
                <Route path="/requests/:id" element={<RequestDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route
                  path="/requests/create"
                  element={
                    <ProtectedRoute>
                      <CreateRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-requests"
                  element={
                    <ProtectedRoute>
                      <MyRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <ProtectedRoute>
                      <DonorAlerts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <DonorProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Reviewer / Admin Portal */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireReviewer={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
