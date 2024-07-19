import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Row, Col, Upload, Select, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UploadOutlined } from '@ant-design/icons';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import httpService from '../../../services/httpService'; // Adjust the import path as needed
import { storage } from '../../../config/firebaseconfig';
import lottie from 'lottie-web';
import './VehicleOwnerRegistration.css';

const { Option } = Select;

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee",
  "Vavuniya"
];

const VehicleOwnerRegistration = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);
  const [emailError, setEmailError] = useState('');
  const container = useRef(null);
  const lottieInstance = useRef(null);
  const [gsCertiUrl, setGsCertiUrl] = useState("");

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

  const onFinish = async (values) => {
    const { certificate, ...rest } = values;

    if (certificate && certificate[0] && certificate[0].originFileObj) {
      setUploading(true);
      const file = certificate[0].originFileObj;
      const storageRef = ref(storage, `certificates/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null, // Removed snapshot parameter as it was unused
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

export default VehicleOwnerRegistration;
