import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        const newToken = localStorage.getItem('token');
        const newUser = localStorage.getItem('user');
        
        if (newToken && newUser) {
          setToken(newToken);
          setUser(JSON.parse(newUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } else {
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  console.log('AuthProvider initializing - token in localStorage:', Boolean(storedToken));
  
  if (storedToken && storedUser) {
    setToken(storedToken);
    setUser(JSON.parse(storedUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  }
  
  setTimeout(() => {
    setLoading(false);
  }, 100);
}, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        
        setToken(newToken);
        setUser(newUser);
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        console.log('Login successful, token set:', Boolean(newToken));
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


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = () => {
    const contextToken = token;
    const storedToken = localStorage.getItem('token');
    const hasToken = Boolean(contextToken || storedToken);
    
    console.log("isAuthenticated check - context token:", Boolean(contextToken));
    console.log("isAuthenticated check - localStorage token:", Boolean(storedToken));
    console.log("isAuthenticated result:", hasToken);
    
    return hasToken;
  };

  const authContextValue = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};