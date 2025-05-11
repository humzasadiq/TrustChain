import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      }
      return { success: false, message: response.data.error || 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/signup', userData);
      
      if (response.data.success) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      }
      return { success: false, message: response.data.error || 'Signup failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const handleGoogleCallback = async (code) => {
    try {
      const response = await axios.post('http://localhost:5000/api/google-login', { token: code });
      
      if (response.data.success) {
        const { session, user } = response.data;
        setToken(session.access_token);
        setUser(user);
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        return { success: true };
      }
      return { success: false, message: response.data.error || 'Google authentication failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Google authentication failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = () => {
    console.log('Checking authentication - token exists:', !!token);
    return !!token;
  };

  const authContextValue = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
    handleGoogleCallback
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};