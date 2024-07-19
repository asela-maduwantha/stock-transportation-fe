import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Row, Col, Select, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import axios from 'axios';
import lottie from 'lottie-web';
import './CustomerRegistration.css';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const CustomerRegistration = () => {
  const [form] = Form.useForm();
  const container = useRef(null);
  const lottieInstance = useRef(null);
  const [emailAvailability, setEmailAvailability] = useState(true); 
  const navigate = useNavigate()

  useEffect(() => {
    if (container.current) {
      lottieInstance.current = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: require('../../../assets/lotties/customer.json'), 
      });
    }
    
    return () => {
      if (lottieInstance.current) {
        lottieInstance.current.destroy();
      }
    };
  }, []);

  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.get(`http://localhost:3000/customer/emailAvailability/${email}`);
      setEmailAvailability(true); 
      console.log(response.data)
    } catch (error) {
      if(error.response.status === 409){
          message.error('Account Alredy Exist with this email')
      }
      console.error('Error checking email availability:', error);
      setEmailAvailability(false); 
    }
  };

  const onFinish = async (values) => {
    try {
      await axios.post('http://localhost:3000/customer/createCustomer', values);
      message.success('Registration successful!');
      navigate('/customer/dashboard')
      form.resetFields(); 
    } catch (error) {
      message.error('Registration failed.');
      console.error('Error creating customer:', error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Please check the form for errors.');
  };

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    if (email) {
      await checkEmailAvailability(email);
    }
  };

  return (
    <div className="registration-container">
      <div className="user-reg-img">
        <div ref={container} id="animation-container" />
      </div>
      <div className="owner-reg-form">
        <h2>Signup as a Customer</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: 'Please input your first name!' }]}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                rules={[{ required: true, message: 'Please input your last name!' }]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: 'The input is not valid E-mail!' },
              { required: true, message: 'Please input your E-mail!' },
              { validator: () => emailAvailability ? Promise.resolve() : Promise.reject(new Error('Email already exists!')) },
            ]}
          >
            <Input placeholder="E-mail" onChange={handleEmailChange} />
          </Form.Item>

          <Form.Item
            name="address"
            rules={[{ required: true, message: 'Please input your address!' }]}
          >
            <Input placeholder="Address" />
          </Form.Item>

          <Form.Item
            name="nic"
            rules={[{ required: true, message: 'Please input your NIC!' }]}
          >
            <Input placeholder="NIC" />
          </Form.Item>

          <Form.Item
            name="gender"
            rules={[{ required: true, message: 'Please select your gender!' }]}
          >
            <Select placeholder="Select Gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="mobileNum"
            rules={[
              { required: true, message: 'Please input your mobile number!' },
              { pattern: /^\d{10}$/, message: 'Please input a valid mobile number!' },
            ]}
          >
            <Input placeholder="Mobile Number" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="Password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm Password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', backgroundColor: '#fdb940', borderColor: '#fdb940' }}>
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CustomerRegistration;
