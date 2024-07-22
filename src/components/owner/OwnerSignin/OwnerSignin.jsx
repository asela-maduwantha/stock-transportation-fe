import React, { useState } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

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
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('userRole', 'owner');

      message.success('Sign-in successful!');
      navigate('/owner/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      message.error('Failed to sign in. Please check your credentials and try again.');
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

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
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

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={formStyle}>
          <h1 style={titleStyle}>Owner Signin</h1>
          <Input
            prefix={<MailOutlined style={iconStyle} />}
            placeholder="Username"
            size="large"
            style={inputStyle}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Input.Password
            prefix={<LockOutlined style={iconStyle} />}
            placeholder="Password"
            size="large"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="primary"
            size="large"
            style={buttonStyle}
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