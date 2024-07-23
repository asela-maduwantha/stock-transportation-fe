import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Upload, Select, Radio, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebaseconfig';
import lottie from 'lottie-web';
import './AddVehicle.css';
import httpService from '../../../services/httpService';

const { Option } = Select;

const vehicleTypes = [
  { type: "Lorry", units: ["Ton", "Kg"] },
  { type: "Van", units: ["Kg", "Liter"] },
  { type: "Freezer", units: ["Kg", "Cubic Meter"] },
  { type: "Tipper Truck", units: ["Ton", "Cubic Meter"] },
  { type: "Container", units: ["Cubic Meter", "Feet"] }
];

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
  const [capacityUnits, setCapacityUnits] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

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

  const uploadFile = (file, path, regNo) => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${regNo}.${fileExtension}`;
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
    const { vehiclePhoto, bookPhoto, regNo, capacity, chargePerKm, ...rest } = values;
    const ownerId = localStorage.getItem('ownerId');

    if (vehiclePhoto && vehiclePhoto[0] && vehiclePhoto[0].originFileObj) {
      setUploading(true);
      try {
        const photoUrl = await uploadFile(vehiclePhoto[0].originFileObj, 'vehicles/photos', regNo);
        let vehicleBookUrl;
        if (bookPhoto && bookPhoto[0] && bookPhoto[0].originFileObj) {
          vehicleBookUrl = await uploadFile(bookPhoto[0].originFileObj, 'vehicles/book-photos', regNo);
        }
        await submitForm({
          ...rest,
          photoUrl,
          vehicleBookUrl,
          regNo,
          capacity: Number(capacity),
          chargePerKm: Number(chargePerKm),
          ownerId,
          heavyVehicle: rest.heavyVehicle === 'true'
        });
        setUploading(false);
        message.success('Vehicle added successfully!');
        form.resetFields();
        setIsFormValid(false);
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
    } catch (error) {
      message.error('Vehicle addition failed.');
      console.error(error);
      throw error;
    }
  };

  const handleVehicleTypeChange = (value) => {
    const vehicle = vehicleTypes.find(v => v.type === value);
    if (vehicle) {
      setCapacityUnits(vehicle.units);
      form.setFieldsValue({ capacityUnit: vehicle.units[0] });
    }
  };

  const onFieldsChange = () => {
    const fields = form.getFieldsError();
    const allValid = fields.every(field => field.errors.length === 0);
    setIsFormValid(allValid);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px' }}>
      <div ref={container} id="animation-container" style={{ paddingLeft: '20px' }} />
      <div style={{ paddingRight: '20px', width: '30%' }}>
        <h2>Add a New Vehicle</h2>
        <Form form={form} layout="vertical" onFinish={onFinish} onFieldsChange={onFieldsChange}>
          <Form.Item name="type" rules={[{ required: true, message: 'Please select your vehicle type!' }]}>
            <Select placeholder="Select Vehicle Type" onChange={handleVehicleTypeChange}>
              {vehicleTypes.map(({ type }) => (
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

          <Form.Item name="capacityUnit" rules={[{ required: true, message: 'Please select your vehicle capacity unit!' }]}>
            <Select placeholder="Select Capacity Unit">
              {capacityUnits.map(unit => (
                <Option key={unit} value={unit}>{unit}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="chargePerKm" rules={[{ required: true, message: 'Please input charge per km!' }]}>
            <Input placeholder="Charge Per Km" />
          </Form.Item>

          <Form.Item label="Vehicle Type" style={{ display: 'flex', alignItems: 'center' }}>
            <Form.Item
              name="heavyVehicle"
              noStyle
              rules={[{ required: true, message: 'Please select the vehicle type!' }]}
            >
              <Radio.Group style={{ marginLeft: '10px' }}>
                <Radio value="true">Heavy</Radio>
                <Radio value="false">Light</Radio>
              </Radio.Group>
            </Form.Item>
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
            <Button type="primary" htmlType="submit" style={{ width: '100%', backgroundColor: '#fdb940', borderColor: '#fdb940' }} loading={uploading} disabled={!isFormValid}>
              Add Vehicle
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddVehicle;
