import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Upload, message, Switch } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UploadOutlined } from '@ant-design/icons';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebaseconfig'; // Adjust the import path as needed
import lottie from 'lottie-web';
import httpService from '../../../services/httpService';
import './AddDriver.css';

const AddDriver = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);
  const [emailError, setEmailError] = useState('');
  const container = useRef(null);
  const lottieInstance = useRef(null);

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
      if (typeof field === 'string') {
        return field.trim() !== "";
      }
      return field !== undefined && field !== null;
    });
    setAllFieldsFilled(allFilled);
  };

  const onEmailBlur = async (e) => {
    const email = e.target.value;
    if (email) {
      try {
        const response = await httpService.get(`driver/emailAvailability/${email}`);
        if (response.status === 200) {
          setEmailError('');
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          setEmailError('This email already has an account');
        } else {
          setEmailError('Error checking email availability');
        }
      }
    }
  };

  const uploadFile = (file, path, fileName) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${path}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        () => {},
        (error) => {
          message.error('Upload failed.');
          console.error(error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const onFinish = async (values) => {
    const ownerId = localStorage.getItem('ownerId');
    const { licenseUrl, policeCertiUrl, photoUrl, ...rest } = values;

    const fullName = `${values.firstName}_${values.lastName}`;
    let licenseUrlValue = '';
    let policeCertificateUrl = '';
    let photoUrlValue = '';

    setUploading(true);
    try {
      if (licenseUrl && licenseUrl[0] && licenseUrl[0].originFileObj) {
        licenseUrlValue = await uploadFile(licenseUrl[0].originFileObj, 'driverLicenses', `${fullName}_license.jpg`);
      }
      if (policeCertiUrl && policeCertiUrl[0] && policeCertiUrl[0].originFileObj) {
        policeCertificateUrl = await uploadFile(policeCertiUrl[0].originFileObj, 'policeCertificates', `${fullName}_police_certificate.jpg`);
      }
      if (photoUrl && photoUrl[0] && photoUrl[0].originFileObj) {
        photoUrlValue = await uploadFile(photoUrl[0].originFileObj, 'driverPhotos', `${fullName}_photo.jpg`);
      }

      submitForm({ ...rest, licenseUrl: licenseUrlValue, policeCertiUrl: policeCertificateUrl, photoUrl: photoUrlValue, ownerId });
      setUploading(false);
    } catch (error) {
      message.error('File upload failed.');
      setUploading(false);
    }
  };

  const submitForm = async (data) => {
    try {
      await httpService.post('owner/createDriver', data);
      message.success('Driver created successfully');
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
      <div className="driver-reg-form">
        <h2>Add Driver</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          onFieldsChange={onFieldsChange}
        >
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            rules={[
              { required: true, message: 'Please input your phone number!' },
              { pattern: /^\d{10}$/, message: 'Please input a valid phone number!' },
            ]}
          >
            <Input placeholder="Phone Number" />
          </Form.Item>

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
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="Password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="licenseUrl"
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}
            rules={[{ required: true, message: 'Please upload your driver&apos;s license!' }]}
          >
            <Upload name="licenseUrl" listType="picture">
              <Button icon={<UploadOutlined />}>Click to Upload Driver&apos;s License</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="photoUrl"
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}
            rules={[{ required: true, message: 'Please upload your photo!' }]}
          >
            <Upload name="photoUrl" listType="picture">
              <Button icon={<UploadOutlined />}>Click to Upload Driver&apos;s Photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="heavyVehicleLic"
            valuePropName="checked"
            label="Heavy Vehicle License"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="policeCertiUrl"
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}
            rules={[{ required: true, message: 'Please upload your police certificate!' }]}
          >
            <Upload name="policeCertificate" listType="picture">
              <Button icon={<UploadOutlined />}>Click to Upload Police Certificate</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', backgroundColor: '#fdb940', borderColor: '#fdb940' }} loading={uploading} disabled={!allFieldsFilled || emailError}>
              Add Driver
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddDriver;