// ProtectedRoute.js
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';

const getToken = () => localStorage.getItem('token');
const getCurrentUserRole = () => localStorage.getItem('userRole');

const getSignInPathByRole = (role) => {
  switch (role) {
    case 'admin': return '/admin/signin';
    case 'customer': return '/customer/signin';
    case 'owner': return '/owner/signin';
    case 'driver': return '/driver/signin';
    default: return '/';
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
    <Suspense fallback={<Spin size="large" />}>
      <Component>
        <Outlet />
      </Component>
    </Suspense>
  );
};

ProtectedRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;