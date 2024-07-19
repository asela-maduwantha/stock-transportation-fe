// CustomerSignin.js
import React, { useState } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService'


const CustomerSignin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (email, password) => {
    try {
      const response = await httpService.post('/customer/signin', {
        userName: email,
        password: password,
      });

      if (response.status === 200) {
        localStorage.setItem('customerId', response.data.customerId);
        message.success('Sign-in successful');
        navigate('/customer/dashboard');
      }
    } catch (error) {
      if (error.response && error.response.status === 406) {
        message.error('Invalid Email or Password');
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
            placeholder="E-mail"
            size="large"
            style={{ marginBottom: '10%' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
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
            onClick={() => handleSignIn(email, password)}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignin;
