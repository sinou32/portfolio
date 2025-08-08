import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portfolioAuthToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('portfolioAuthToken');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// Public API calls
export const fetchProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Auth API calls
export const login = async (password) => {
  try {
    const response = await api.post('/auth/login', { password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const verifyAuth = async () => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Auth verification error:', error);
    throw error;
  }
};

// Admin API calls
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/admin/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const response = await api.put(`/admin/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    const response = await api.delete(`/admin/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Auth helper functions
export const setAuthToken = (token) => {
  localStorage.setItem('portfolioAuthToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('portfolioAuthToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('portfolioAuthToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};