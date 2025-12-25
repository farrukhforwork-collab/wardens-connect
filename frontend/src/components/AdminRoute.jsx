import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const isAdmin = user.isSuperAdmin || user.role?.name === 'Admin' || user.role?.name === 'Super Admin';
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;
