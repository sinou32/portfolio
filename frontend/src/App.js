import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Portfolio from './components/Portfolio';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Toaster } from './components/ui/toaster';
import { isAuthenticated, verifyAuth, clearAuthToken } from './services/api';

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    if (!isAuthenticated()) {
      setAuthState({ isAuthenticated: false, loading: false });
      return;
    }

    try {
      await verifyAuth();
      setAuthState({ isAuthenticated: true, loading: false });
    } catch (error) {
      clearAuthToken();
      setAuthState({ isAuthenticated: false, loading: false });
    }
  };

  const handleLogin = () => {
    setAuthState({ isAuthenticated: true, loading: false });
  };

  const handleLogout = () => {
    setAuthState({ isAuthenticated: false, loading: false });
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route 
            path="/admin" 
            element={
              !authState.isAuthenticated ? (
                <AdminLogin onLogin={handleLogin} />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              authState.isAuthenticated ? (
                <AdminDashboard 
                  onLogout={handleLogout}
                  onGoHome={() => window.location.href = '/'}
                />
              ) : (
                <Navigate to="/admin" replace />
              )
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;