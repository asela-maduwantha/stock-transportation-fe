import React, { useState } from 'react';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, Form, message } from 'antd';
import httpService from '../../../services/httpService';

const AdminCreate = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await httpService.post('/admin/create', values);
      if (response.status === 200) {
        message.success('Admin successfully created');
      }
    } catch (error) {
      if (error.response && error.response.status === 500) {
        message.error('Internal server error');
      } else {
        message.error('Error creating admin. Please try again later.');
      }
      console.error('Error creating admin:', error);
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
          <h1 style={titleStyle}>Create Admin</h1>
          <Form onFinish={onFinish}>
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: 'Please input your first name!' }]}
            >
              <Input
                prefix={<UserOutlined style={iconStyle} />}
                placeholder="First Name"
                size="large"
                style={inputStyle}
              />
            </Form.Item>
            <Form.Item
              name="lastName"
              rules={[{ required: true, message: 'Please input your last name!' }]}
            >
              <Input
                prefix={<UserOutlined style={iconStyle} />}
                placeholder="Last Name"
                size="large"
                style={inputStyle}
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input
                prefix={<MailOutlined style={iconStyle} />}
                placeholder="Email"
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
                Create Admin
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreate;
