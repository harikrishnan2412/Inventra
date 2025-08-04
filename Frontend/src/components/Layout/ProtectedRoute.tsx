import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const userDataString = localStorage.getItem('user');
  
  if (!userDataString) {
    // If no user data, redirect to login
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userDataString);
  const userRole = user?.role;

  if (allowedRoles.includes(userRole)) {
    // If the user's role is in the allowed list, render the page
    return <Outlet />;
  } else {
        switch (userRole) {
            case 'admin':
                return <Navigate to="/dashboarda" replace />;
            case 'manager':
                return <Navigate to="/dashboardm" replace />;
            case 'staff':
                return <Navigate to="/dashboards" replace />;
            default:
                // If role is unknown, send to login
                return <Navigate to="/login" replace />;
        }
  }
};

export default ProtectedRoute;