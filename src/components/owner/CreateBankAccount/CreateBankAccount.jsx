import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, message, Typography } from 'antd';
import { BankOutlined, UserOutlined, BranchesOutlined, NumberOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const PrimaryButton = ({ children, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Button
      {...props}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: '#fdb940',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 'normal',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, opacity 0.3s ease',
        opacity: isHovered ? '0.8' : '1',
      }}
    >
      {children}
    </Button>
  );
};

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
};

const CreateBankAccount = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const ownerId = localStorage.getItem('ownerId');
    
    try {
      await axios.post(`/owner/bankAccount/${ownerId}`, values);
      message.success('Bank account created successfully');
      form.resetFields();
    } catch (error) {
      console.log(error)
      message.error('Failed to create bank account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
        <BankOutlined /> Create Bank Account
      </Title>
      <Form
        form={form}
        name="createBankAccount"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="firstName"
          rules={[{ required: true, message: 'Please input your first name!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="First Name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          rules={[{ required: true, message: 'Please input your last name!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Last Name" />
        </Form.Item>

        <Form.Item
          name="bank"
          rules={[{ required: true, message: 'Please input your bank name!' }]}
        >
          <Input prefix={<BankOutlined />} placeholder="Bank Name" />
        </Form.Item>

        <Form.Item
          name="branch"
          rules={[{ required: true, message: 'Please input your branch name!' }]}
        >
          <Input prefix={<BranchesOutlined />} placeholder="Branch Name" />
        </Form.Item>

        <Form.Item
          name="account"
          rules={[{ required: true, message: 'Please input your account number!' }]}
        >
          <Input prefix={<NumberOutlined />} placeholder="Account Number" />
        </Form.Item>

        <Form.Item>
          <PrimaryButton type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
            Create Bank Account
          </PrimaryButton>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateBankAccount;