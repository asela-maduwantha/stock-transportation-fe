import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Row, Col, Upload, Select, message, Progress } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UploadOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import httpService from '../../../services/httpService';
import { storage } from '../../../config/firebaseconfig';
import lottie from 'lottie-web';
import './VehicleOwnerRegistration.css';
import PropTypes from 'prop-types'

const { Option } = Select;

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];


const PasswordRequirementItem = ({ met, text }) => (
  <div style={{ color: met ? '#52c41a' : '#ff4d4f', marginBottom: '4px' }}>
    {met ? <CheckCircleFilled /> : <CloseCircleFilled />}
    <span style={{ marginLeft: '8px' }}>{text}</span>
  </div>
);
const VehicleOwnerRegistration = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);
  const [emailError, setEmailError] = useState('');
  const container = useRef(null);
  const lottieInstance = useRef(null);
  const [gsCertiUrl, setGsCertiUrl] = useState("");
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
        animationData: require('../../../assets/lotties/register.json'),
      });
    }

    return () => {
      if (lottieInstance.current) {
        lottieInstance.current.destroy();
      }
    };
  }, []);

  const onFieldsChange = () => {
    const values = form.getFieldsValue();
    const allFilled = Object.values(values).every((field) => {
      if (Array.isArray(field)) {
        return field.length > 0;
      }
      return field && field.trim() !== "";
    });
    setAllFieldsFilled(allFilled);
  };

  const onEmailBlur = async (e) => {
    const email = e.target.value;
    if (email) {
      try {
        const response = await httpService.get(`/owner/emailAvailability/${email}`);
        if (response.data && response.data.exists) {
          setEmailError('This email already has an account');
        } else {
          setEmailError('');
        }
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 409) {
          setEmailError('This email already has an account');
        } else {
          setEmailError('Error checking email availability');
        }
      }
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPasswordStrength(checkPasswordStrength(password));
  };

  

  const onFinish = async (values) => {
    const { certificate, ...rest } = values;

    if (certificate && certificate[0] && certificate[0].originFileObj) {
      setUploading(true);
      const file = certificate[0].originFileObj;
      const storageRef = ref(storage, `certificates/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null, 
        (error) => {
          message.error('Upload failed.');
          console.error(error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setGsCertiUrl(downloadURL);
          submitForm({ ...rest, gsCertiUrl: downloadURL });
          setUploading(false);
        }
      );
    } else {
      submitForm({ ...rest, gsCertiUrl });
    }
  };

  const submitForm = async (data) => {
    const payload = {
      id: data.nic,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      nic: data.nic,
      email: data.email,
      mobNumber: data.mobileNumber,
      password: data.password,
      gsCertiUrl: data.gsCertiUrl,
    };

    try {
      await httpService.post('/owner/tempCreate', payload);
      message.success('Registration successful!');
      form.resetFields();
    } catch (error) {
      message.error('Registration failed.');
      console.error(error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Please check the form for errors.');
  };



  return (
    <div className="registration-container">
      <div className="user-reg-img">
        <div ref={container} id="animation-container" />
      </div>
      <div className="owner-reg-form">
        <h2>Signup as a Vehicle Owner with Us</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          onFieldsChange={onFieldsChange}
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
              { required: true, type: 'email', message: 'Please input a valid E-mail!' }
            ]}
            validateStatus={emailError ? 'error' : ''}
            help={emailError}
          >
            <Input placeholder="E-mail" onBlur={onEmailBlur} />
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
            name="mobileNumber"
            rules={[
              { required: true, message: 'Please input your mobile number!' },
              { pattern: /^\d{10}$/, message: 'Please input a valid mobile number!' },
            ]}
          >
            <Input placeholder="Mobile Number" />
          </Form.Item>

          <Form.Item
            name="district"
            rules={[{ required: true, message: 'Please select your district!' }]}
          >
            <Select
              showSearch
              placeholder="Select District"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {districts.map((district) => (
                <Option key={district} value={district}>{district}</Option>
              ))}
            </Select>
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
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm Password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="certificate"
            valuePropName="fileList"
            getValueFromEvent={({ file, fileList }) => {
              if (file.status === 'done') {
                return fileList.map((file) => ({
                  uid: file.uid,
                  name: file.name,
                  status: file.status,
                  url: file.response ? file.response.url : '',
                }));
              }
              return fileList;
            }}
          >
            <Upload
              name="certificate"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />}>Upload Grama Niladhari Certificate</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading} disabled={!allFieldsFilled}>
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

PasswordRequirementItem.propTypes = {
  met: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
};


export default VehicleOwnerRegistration;