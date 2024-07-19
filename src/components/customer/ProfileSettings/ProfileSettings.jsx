import React, { useState } from 'react';
import { Form, Input, Button, Card, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const ProfileSettings = () => {
  const [form] = Form.useForm();

  const initialData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    address: '123 Main Street, City',
    nic: '123456789V',
    mobileNumber: '1234567890',
    profileImage: 'https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg', 
  };

  const [userData, setUserData] = useState(initialData);

  const onFinish = (values) => {
   
    console.log('Received values:', values);

    setUserData(values);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <Card
        title="Profile Settings"
        extra={
          <Avatar
            size={64}
            icon={<UserOutlined />}
            src={userData.profileImage} // Display user profile image
            alt="Profile Picture"
          />
        }
      >
        <Form
          form={form}
          name="profileForm"
          initialValues={userData}
          onFinish={onFinish}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter your first name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter your last name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email address!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter your address!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="nic"
            label="NIC"
            rules={[{ required: true, message: 'Please enter your NIC number!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="mobileNumber"
            label="Mobile Number"
            rules={[{ required: true, message: 'Please enter your mobile number!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfileSettings;
