import React, { useState } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';
import './DriverSignin.css';

const DriverSignin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await httpService.post('/driver/signin', values);
      localStorage.setItem('driverId', response.data.id);
      message.success('Sign-in successful!');
      navigate('/driver/dashboard');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        message.error('Driver not found.');
      } else if (error.response && error.response.status === 406) {
        message.error('Mismatched credentials.');
      } else {
        message.error('Sign-in failed.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-form">
          <h1>Driver Signin</h1>
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

export default DriverSignin;