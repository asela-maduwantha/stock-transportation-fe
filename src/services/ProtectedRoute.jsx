import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';

// Helper function to get the current user's token from local storage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get the current user's role from local storage
const getCurrentUserRole = () => {
  return localStorage.getItem('userRole');
};

// Helper function to get the sign-in path based on user role
const getSignInPathByRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/signin';
    case 'customer':
      return '/customer/signin';
    case 'owner':
      return '/owner/signin';
    case 'driver':
      return '/driver/signin';
    default:
      return '/';
  }
};

const ProtectedRoute = ({ component: Component, allowedRoles }) => {
  const token = getToken();
  const userRole = getCurrentUserRole();
  const signInPath = getSignInPathByRole(userRole);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={signInPath} replace />;
  }

  return (
    <Component>
      <Outlet />
    </Component>
  );
};

ProtectedRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;