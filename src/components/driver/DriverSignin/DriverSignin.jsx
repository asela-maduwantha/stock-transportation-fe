import React, { useState } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const DriverSignin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await httpService.post('/driver/signin', values);
      localStorage.setItem('driverId', response.data.id);
      localStorage.setItem('token', response.data.access_token);
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
          <h1 style={titleStyle}>Driver Signin</h1>
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
        </div>
      </div>
    </div>
  );
};

export default DriverSignin;