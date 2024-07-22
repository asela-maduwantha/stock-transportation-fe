import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Upload, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebaseconfig'; // Adjust the import path as needed
import lottie from 'lottie-web';
import './AddVehicle.css';
import httpService from '../../../services/httpService';

const { Option } = Select;

const vehicleTypes = ["Lorry", "Van", "Car", "Truck", "Bus"];
const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee",
  "Vavuniya"
];

const AddVehicle = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  // const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState("");
  // const [bookPhotoUrl, setBookPhotoUrl] = useState("");

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

  const uploadFile = (file, path) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${path}/${file.name}`);
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
    const { vehiclePhoto, bookPhoto, ...rest } = values;
    const ownerId = localStorage.getItem('ownerId');

    if (vehiclePhoto && vehiclePhoto[0] && vehiclePhoto[0].originFileObj) {
      setUploading(true);
      try {
        const vehiclePhotoUrl = await uploadFile(vehiclePhoto[0].originFileObj, 'vehicles/photos');
        if (bookPhoto && bookPhoto[0] && bookPhoto[0].originFileObj) {
          const bookPhotoUrl = await uploadFile(bookPhoto[0].originFileObj, 'vehicles/book-photos');
          submitForm({ ...rest, vehiclePhotoUrl, bookPhotoUrl, ownerId });
        } else {
          submitForm({ ...rest, vehiclePhotoUrl, ownerId });
        }
        setUploading(false);
      } catch (error) {
        message.error('File upload failed.');
        setUploading(false);
      }
    } else {
      message.error('Please upload the vehicle photo.');
    }
  };

  const submitForm = async (data) => {
    try {
      await httpService.post('owner/createVehicle', data);
      message.success('Vehicle added successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Vehicle addition failed.');
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px' }}>
      <div ref={container} id="animation-container" style={{ paddingLeft: '20px' }} />
      <div style={{ paddingRight: '20px', width: '30%' }}>
        <h2>Add a New Vehicle</h2>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="type" rules={[{ required: true, message: 'Please select your vehicle type!' }]}>
            <Select placeholder="Select Vehicle Type">
              {vehicleTypes.map((type) => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="regNo" rules={[{ required: true, message: 'Please input your vehicle registration number!' }]}>
            <Input placeholder="Vehicle Registration Number" />
          </Form.Item>

          <Form.Item name="preferredArea" rules={[{ required: true, message: 'Please select your preferred area!' }]}>
            <Select placeholder="Select Preferred Area">
              {districts.map((district) => (
                <Option key={district} value={district}>{district}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="capacity" rules={[{ required: true, message: 'Please input your vehicle capacity!' }]}>
            <Input placeholder="Vehicle Capacity" />
          </Form.Item>

          <Form.Item name="capacityUnit" rules={[{ required: true, message: 'Please input your vehicle capacity unit!' }]}>
            <Input placeholder="Vehicle Capacity Unit" />
          </Form.Item>

          <Form.Item name="vehiclePhoto" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList} rules={[{ required: true, message: 'Please upload your vehicle photo!' }]}>
            <Upload name="vehiclePhoto" listType="picture">
              <Button icon={<UploadOutlined />}>Upload Vehicle Photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="bookPhoto" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}>
            <Upload name="bookPhoto" listType="picture">
              <Button icon={<UploadOutlined />}>Upload Vehicle Book Photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', backgroundColor: '#fdb940', borderColor: '#fdb940' }} loading={uploading}>
              Add Vehicle
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddVehicle;
