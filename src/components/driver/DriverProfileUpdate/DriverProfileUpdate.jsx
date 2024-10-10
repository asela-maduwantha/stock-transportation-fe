import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, message, Upload, Spin, Avatar, Radio } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, UploadOutlined, HomeOutlined } from '@ant-design/icons';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../../config/firebaseconfig'; // Adjust this import path as needed
import httpService from '../../../services/httpService';

const DriverProfileUpdate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    const id = localStorage.getItem('driverId');
    try {
      const response = await httpService.get(`/driver/profile/${id}`);
      const data = response.data;
      setProfileData(data);
      form.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
        phoneNo: data.phoneNo,
        heavyVehicle: data.heavyVehicle,
      });
    } catch (error) {
      message.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onFinish = async (values) => {
    setLoading(true);
    const id = localStorage.getItem('driverId');
    try {
      let profilePicUrl = profileData.profilePic;

      if (values.profilePic?.length > 0) {
        setUploading(true);
        const file = values.profilePic[0].originFileObj;
        const storageRef = ref(storage, `driver_profile_pictures/${id}`);

        // Delete the old profile picture if it exists
        if (profilePicUrl) {
          const oldFileRef = ref(storage, profilePicUrl);
          await deleteObject(oldFileRef);
        }

        // Upload the new profile picture
        const uploadTask = uploadBytesResumable(storageRef, file);
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            async () => {
              profilePicUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
        setUploading(false);
      }

      await httpService.put(`/driver/profile/${id}`, {
        mobileNo: values.phoneNo,
        profilePic: profilePicUrl,
      });

      message.success('Profile updated successfully');
      fetchProfileData(); // Refresh the profile data
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  if (loading && !profileData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Update Driver Profile</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Avatar
          size={120}
          src={profileData?.profilePic}
          icon={<UserOutlined />}
        />
      </div>
      <Form
        form={form}
        name="driver-profile-update"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="profilePic"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          style={{ textAlign: 'center' }}
        >
          <Upload 
            name="profilePic" 
            listType="picture" 
            maxCount={1} 
            beforeUpload={() => false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Change Profile Picture
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item name="firstName" label="First Name">
          <Input prefix={<UserOutlined />} disabled />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name">
          <Input prefix={<UserOutlined />} disabled />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input prefix={<MailOutlined />} disabled />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input prefix={<HomeOutlined />} disabled />
        </Form.Item>
        <Form.Item
          name="phoneNo"
          label="Mobile Number"
          rules={[
            { required: true, message: 'Please input your mobile number!' },
            { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit mobile number!' },
          ]}
        >
          <Input prefix={<PhoneOutlined />} />
        </Form.Item>
        <Form.Item name="heavyVehicle" label="Heavy Vehicle License">
          <Radio.Group disabled>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading || uploading} block>
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DriverProfileUpdate;