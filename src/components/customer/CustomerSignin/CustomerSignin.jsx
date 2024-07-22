import React, { useState } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';
import './CustomerSignin.css'; // Import the CSS file for custom styling

const CustomerSignin = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!userName || !password) {
      message.error('Please provide both username and password.');
      return;
    }

    try {
      const response = await httpService.post('/customer/signin', {
        userName,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('customerId', response.data.customerId);
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
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-form">
          <h1>Customer Signin</h1>
          <Input
            prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Username"
            size="large"
            style={{ marginBottom: '10%' }}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Input.Password
            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Password"
            size="large"
            style={{ marginBottom: '10%' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="primary"
            size="large"
            className="signin-button"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignin;
