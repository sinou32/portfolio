import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { login, setAuthToken } from '../services/api';
import { useToast } from '../hooks/use-toast';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(password);
      if (response.success) {
        setAuthToken(response.token);
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        onLogin();
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.response?.data?.detail || "Incorrect password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-slate-600" />
          </div>
          <CardTitle className="text-2xl font-light text-slate-800">
            Admin Access
          </CardTitle>
          <p className="text-slate-600 text-sm">
            Enter password to manage portfolio projects
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12 border-slate-300 focus:ring-slate-400"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-slate-800 hover:bg-slate-700 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Demo password: architecture2024
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;