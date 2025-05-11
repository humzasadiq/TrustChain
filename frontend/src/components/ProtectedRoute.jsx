import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  
  // Add an effect to ensure token is properly loaded from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('ProtectedRoute - storedToken from localStorage:', Boolean(storedToken));
    console.log('ProtectedRoute - token from context:', Boolean(token));
    
    // Set isReady to true once we've checked both sources
    setIsReady(true);
  }, [token]);
  
  if (loading || !isReady) {
    return <div>Loading...</div>;
  }
  
  // Use localStorage as backup if token isn't in context
  const hasToken = Boolean(token || localStorage.getItem('token'));
  
  if (!hasToken) {
    console.log('Redirecting to login - no valid token found');
    return <Navigate to="/login" replace />;
  }
  
  console.log('Rendering protected route content');
  return <Outlet />;
};

export default ProtectedRoute;