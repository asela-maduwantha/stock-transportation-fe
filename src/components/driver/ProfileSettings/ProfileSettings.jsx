import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';

const ProfileSettings = () => {
  const [loading, setLoading] = useState(false);

  const handleFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      console.log('Profile Updated:', values);
      setLoading(false);
    }, 1000);
  };

  return (
    <Card title="Profile Settings">
      <Form
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProfileSettings;
