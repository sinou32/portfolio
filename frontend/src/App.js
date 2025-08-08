import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Portfolio from './components/Portfolio';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Toaster } from './components/ui/toaster';
import { checkAuthentication, setAuthenticated } from './mock';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(checkAuthentication());
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthenticated(false);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route 
            path="/admin" 
            element={
              !isAuthenticated ? (
                <AdminLogin onLogin={handleLogin} />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              isAuthenticated ? (
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