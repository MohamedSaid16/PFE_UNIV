/*
  PrivateRoute — Role-based route guard.
  Wraps protected routes: checks auth + optional role whitelist.
  Uses our useAuth hook (not Redux).
*/

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * @param {string[]} allowedRoles  — e.g. ['TEACHER','ADMIN_SUPER']
 * @param {string}   redirectTo    — where to send unauthenticated users
 */
const PrivateRoute = ({ allowedRoles = [], redirectTo = '/login' }) => {
  const { isAuthenticated, user, loading } = useAuth();

  /* Still checking session — show a centered spinner */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="h-10 w-10 rounded-full border-[3px] border-surface-300 border-t-brand animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && user && !user.roles?.some(r => allowedRoles.includes(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
