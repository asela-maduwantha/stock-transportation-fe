import React, { useState } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';
import './OwnerSignin.css'; // We'll create this CSS file for styling

const OwnerSignin = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!userName || !password) {
      message.error('Please provide both username and password.');
      return;
    }

    try {
      const response = await httpService.post('/owner/signin', { userName, password });
      const { id } = response.data;
      localStorage.setItem('ownerId', id);
      message.success('Sign-in successful!');
      navigate('/owner/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      message.error('Failed to sign in. Please check your credentials and try again.');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-form">
          <h1>Owner Signin</h1>
          <Input
            prefix={<MailOutlined className="input-icon" />}
            placeholder="Username"
            size="large"
            className="signin-input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Input.Password
            prefix={<LockOutlined className="input-icon" />}
            placeholder="Password"
            size="large"
            className="signin-input"
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

export default OwnerSignin;