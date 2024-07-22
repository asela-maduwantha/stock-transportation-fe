import React, { useState } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';
import './CustomerSignin.css';

const CustomerSignin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await httpService.post('/customer/signin', values);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-form">
          <h1>Customer Signin</h1>
          <Form onFinish={onFinish}>
            <Form.Item
              name="userName"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Username"
                size="large"
                className="signin-input"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Password"
                size="large"
                className="signin-input"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="signin-button"
                loading={loading}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignin;