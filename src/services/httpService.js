import axios from 'axios';
import { message } from 'antd';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://stocktrans.azurewebsites.net/';

const httpService = axios.create({
  baseURL,
  timeout: 50000,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
});

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

// Request interceptor for adding Authorization header
httpService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
httpService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data, headers } = error.response;
      switch (status) {
        case 401: {
          const userRole = localStorage.getItem('userRole');
          const signInPath = getSignInPathByRole(userRole);
          window.location.href = signInPath;
          break;
        }
        case 307: {
          const redirectUrl = headers.location;
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
          break;
        }
        case 409:
          message.error('Conflict: The resource already exists.');
          break;
        case 404: {
          const msg = data?.message || 'Not found.';
          message.warning(msg)
          if (window.location.pathname !== '/owner/wallet') {
            window.location.href = '/owner/create-bank-account';
          }
          return Promise.reject(new Error(msg));
        }
        default:
          message.error('An error occurred. Please try again later.');
          break;
      }
    } else if (error.request) {
      message.error('Network error. Please check your internet connection.');
    } else {
      message.error('An unexpected error occurred. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export default httpService;