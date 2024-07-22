import React from 'react';
import PropTypes from 'prop-types';
import { Route, Navigate } from 'react-router-dom';

const getCurrentUserRole = () => {
  return localStorage.getItem('userRole'); 
};

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

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const userRole = getCurrentUserRole();
  const signInPath = getSignInPathByRole(userRole);

  return (
    <Route
      {...rest}
      render={(props) =>
        allowedRoles.includes(userRole) ? (
          <Component {...props} />
        ) : (
          <Navigate to={signInPath} /> 
        )
      }
    />
  );
};

ProtectedRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;
