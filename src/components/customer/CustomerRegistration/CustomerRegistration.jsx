import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Row, Col, Select, message, Progress } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import PropTypes from 'prop-types';
import lottie from 'lottie-web';
import './CustomerRegistration.css';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const { Option } = Select;

const PasswordRequirementItem = ({ met, text }) => (
  <div style={{ color: met ? '#52c41a' : '#ff4d4f', marginBottom: '4px' }}>
    {met ? <CheckCircleFilled /> : <CloseCircleFilled />}
    <span style={{ marginLeft: '8px' }}>{text}</span>
  </div>
);

PasswordRequirementItem.propTypes = {
  met: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
};

const CustomerRegistration = () => {
  const [form] = Form.useForm();
  const container = useRef(null);
  const lottieInstance = useRef(null);
  const [emailAvailability, setEmailAvailability] = useState(true);
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '#ff4d4f'
  });

  const checkPasswordStrength = (password) => {
    let score = 0;
    let checks = {
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calculate score
    score += checks.length ? 20 : 0;
    score += checks.hasUpperCase ? 20 : 0;
    score += checks.hasLowerCase ? 20 : 0;
    score += checks.hasNumbers ? 20 : 0;
    score += checks.hasSpecialChar ? 20 : 0;

    // Determine strength message and color
    let strengthInfo = {
      score,
      message: 'Weak',
      color: '#ff4d4f'  // red
    };

    if (score > 60) {
      strengthInfo.message = 'Strong';
      strengthInfo.color = '#52c41a';  // green
    } else if (score > 30) {
      strengthInfo.message = 'Good';
      strengthInfo.color = '#faad14';  // yellow
    }

    return strengthInfo;
  };

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
      const response = await httpService.get(`/customer/emailAvailability/${email}`);
      setEmailAvailability(true);
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        message.error('Account Already Exists with this email');
      }
      console.error('Error checking email availability:', error);
      setEmailAvailability(false);
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPasswordStrength(checkPasswordStrength(password));
  };

  const onFinish = async (values) => {
    try {
      await httpService.post('/customer/createCustomer', values);
      message.success('Registration successful!');
      navigate('/customer/dashboard');
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
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
              {
                pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
                message: 'Password must contain at least one uppercase letter, one number, and one special character!'
              }
            ]}
          >
            <Input.Password
              placeholder="Password"
              onChange={handlePasswordChange}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <div style={{ marginBottom: '16px' }}>
            <Progress
              percent={passwordStrength.score}
              status="active"
              strokeColor={passwordStrength.color}
              format={() => passwordStrength.message}
            />
            <div style={{ marginTop: '8px' }}>
              <PasswordRequirementItem
                met={form.getFieldValue('password')?.length >= 8}
                text="At least 8 characters"
              />
              <PasswordRequirementItem
                met={/[A-Z]/.test(form.getFieldValue('password') || '')}
                text="At least one uppercase letter"
              />
              <PasswordRequirementItem
                met={/[0-9]/.test(form.getFieldValue('password') || '')}
                text="At least one number"
              />
              <PasswordRequirementItem
                met={/[!@#$%^&*(),.?":{}|<>]/.test(form.getFieldValue('password') || '')}
                text="At least one special character"
              />
            </div>
          </div>

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