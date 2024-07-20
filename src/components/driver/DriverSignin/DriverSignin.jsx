import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, Form, message } from 'antd';
import httpService from '../../../services/httpService'; // Update the import to use httpService
import './DriverSignin.css';

const DriverSignin = ({ onSignIn, title }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await httpService.post('/driver/signin', values); 
      localStorage.setItem('driverId', response.data.id);
      message.success('Sign-in successful!');
      onSignIn();
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
    <div className="signin-card">
      <div className="signin-form">
        <h1>{title}</h1><br />
        <Form onFinish={onFinish}>
          <Form.Item
            name="userName"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
              size="large"
              style={{ marginBottom: '10%' }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Password"
              size="large"
              style={{ marginBottom: '10%' }}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ backgroundColor: '#fdb940', border: 'none', width: '80%', height: '50px' }}
            loading={loading}
          >
            Sign In
          </Button>
        </Form>
      </div>
    </div>
  );
};

DriverSignin.propTypes = {
  onSignIn: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default DriverSignin;
