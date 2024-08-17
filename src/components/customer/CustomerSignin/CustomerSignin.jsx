import React, { useState, useEffect, useCallback } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, Form, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';
import CustomerImg from '../../../assets/images/ownersignin.jpg'; 

// Custom hook to detect screen size
const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return isMobile;
};

const CustomerSignin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useScreenSize(); // Use custom hook to detect mobile

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await httpService.post('/customer/signin', values);
      if (response.status === 200) {
        localStorage.setItem('customerId', response.data.customerId);
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('userRole', 'customer');

        message.success('Sign-in successful');
        navigate('/customer/dashboard');
      }
    } catch (error) {
      if (error.response && error.response.status === 406) {
        message.error('Invalid Username or Password');
      } else {
        message.error('Error signing in. Please try again later.');
      }
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '90vh',
    padding: '20px',
    backgroundColor: '#f0f2f5',
  };

  const formContainerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '90%',
    maxWidth: '80%',
    minHeight: '60vh',
  };

  const imageContainerStyle = {
    flex: '1',
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const imageStyle = {
    maxWidth: '100%',
    height: '90%',
    objectFit: 'cover',
    borderRadius: '8px',
  };

  const formStyle = {
    flex: '0.5',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#fdb940',
  };

  const inputStyle = {
    marginBottom: '16px',
  };

  const iconStyle = {
    color: 'rgba(0, 0, 0, 0.25)',
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#fdb940',
    borderColor: '#fdb940',
  };

  const forgotPasswordLinkStyle = {
    display: 'block',
    textAlign: 'center',
    marginTop: '16px',
    color: '#fdb940',
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={imageContainerStyle}>
          <img
            src={CustomerImg}
            alt="Customer Signin"
            style={imageStyle}
          />
        </div>
        <div style={formStyle}>
          <h1 style={titleStyle}>Customer Signin</h1>
          <Form onFinish={onFinish}>
            <Form.Item
              name="userName"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input
                prefix={<MailOutlined style={iconStyle} />}
                placeholder="Username"
                size="large"
                style={inputStyle}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={iconStyle} />}
                placeholder="Password"
                size="large"
                style={inputStyle}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={buttonStyle}
                loading={loading}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
          <Link to="/customer/forgot-password" style={forgotPasswordLinkStyle}>
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignin;
