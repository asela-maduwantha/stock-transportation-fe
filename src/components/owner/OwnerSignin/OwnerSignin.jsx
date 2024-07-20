import React, { useState } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd'; // Import message from antd
import httpService from '../../../services/httpService';
import { useNavigate } from 'react-router-dom';
import './OwnerSignin.css'

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
    <div className="signin-card">
      <div className="signin-form">
        <h1>Owner Signin</h1><br></br>
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
          style={{ backgroundColor: '#fdb940', border: 'none', width: '80%', height: '50px' }}
          onClick={handleSignIn}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default OwnerSignin;