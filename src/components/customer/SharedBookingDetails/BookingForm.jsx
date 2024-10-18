import React from 'react';
import { Form, Input, InputNumber, Select, Button, Typography, Alert } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Autocomplete } from "@react-google-maps/api";
import PropTypes from 'prop-types';

const { Text } = Typography;
const { Option } = Select;

const BookingForm = ({ 
  form, 
  onSubmit, 
  maxCapacity, 
  capacityUnit, 
  isButtonDisabled,
  buttonStyle,
  setPickupAutocomplete,
  setDropoffAutocomplete,
  handlePickupSelect,
  handleDropoffSelect,
  pickupLocation,
  setPickupLocation,
  dropoffLocation,
  setDropoffLocation,
  loadingTime,
  setLoadingTime,
  unloadingTime,
  setUnloadingTime,
  setIsHovered,
  pickupAccepted,
  dropoffAccepted
}) => (
  <Form form={form} layout="vertical" onFinish={onSubmit}>
    <Form.Item
      name="capacity"
      label={<Text strong>Required Capacity</Text>}
      rules={[
        { required: true, message: "Please input the required capacity" },
        { type: "number", min: 0.1, max: maxCapacity, message: `Capacity must be between 0.1 and ${maxCapacity}` },
      ]}
    >
      <InputNumber
        step={0.1}
        min={0.1}
        max={maxCapacity}
        addonAfter={capacityUnit}
      />
    </Form.Item>

    <Form.Item
      name="pickupLocation"
      label={<Text strong>Pickup Location</Text>}
      rules={[{ required: true, message: "Please input your pickup location" }]}
    >
      <div>
        <Autocomplete
          onLoad={(autocomplete) => setPickupAutocomplete(autocomplete)}
          onPlaceChanged={handlePickupSelect}
        >
          <Input
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            prefix={<EnvironmentOutlined />}
            placeholder="Enter pickup location"
            suffix={pickupAccepted && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Autocomplete>
        {pickupAccepted && (
          <Alert
            message="Pickup location accepted"
            type="success"
            showIcon
            style={{ marginTop: '8px' }}
          />
        )}
      </div>
    </Form.Item>

    <Form.Item
      name="dropoffLocation"
      label={<Text strong>Dropoff Location</Text>}
      rules={[{ required: true, message: "Please input your dropoff location" }]}
    >
      <div>
        <Autocomplete
          onLoad={(autocomplete) => setDropoffAutocomplete(autocomplete)}
          onPlaceChanged={handleDropoffSelect}
        >
          <Input
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            prefix={<EnvironmentOutlined />}
            placeholder="Enter drop-off location"
            suffix={dropoffAccepted && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Autocomplete>
        {dropoffAccepted && (
          <Alert
            message="Dropoff location accepted"
            type="success"
            showIcon
            style={{ marginTop: '8px' }}
          />
        )}
      </div>
    </Form.Item>

    <Form.Item
      name="loadingTime"
      label={<Text strong>Loading Time</Text>}
      rules={[{ required: true, message: "Please select loading time" }]}
    >
      <Select
        value={loadingTime}
        onChange={(value) => setLoadingTime(value)}
      >
        <Option value={15}>15 minutes</Option>
        <Option value={30}>30 minutes</Option>
        <Option value={60}>60 minutes</Option>
      </Select>
    </Form.Item>

    <Form.Item
      name="unloadingTime"
      label={<Text strong>Unloading Time</Text>}
      rules={[{ required: true, message: "Please select unloading time" }]}
    >
      <Select
        value={unloadingTime}
        onChange={(value) => setUnloadingTime(value)}
      >
        <Option value={15}>15 minutes</Option>
        <Option value={30}>30 minutes</Option>
        <Option value={60}>60 minutes</Option>
      </Select>
    </Form.Item>

    <Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isButtonDisabled}
        title={isButtonDisabled ? "Please select valid pickup and dropoff locations" : ""}
      >
        Proceed to Summary
      </Button>
    </Form.Item>
  </Form>
);

BookingForm.propTypes = {
    form: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    maxCapacity: PropTypes.number.isRequired,
    capacityUnit: PropTypes.string.isRequired,
    isButtonDisabled: PropTypes.bool.isRequired,
    buttonStyle: PropTypes.object.isRequired,
    setPickupAutocomplete: PropTypes.func.isRequired,
    setDropoffAutocomplete: PropTypes.func.isRequired,
    handlePickupSelect: PropTypes.func.isRequired,
    handleDropoffSelect: PropTypes.func.isRequired,
    pickupLocation: PropTypes.string.isRequired,
    setPickupLocation: PropTypes.func.isRequired,
    dropoffLocation: PropTypes.string.isRequired,
    setDropoffLocation: PropTypes.func.isRequired,
    loadingTime: PropTypes.number.isRequired,
    setLoadingTime: PropTypes.func.isRequired,
    unloadingTime: PropTypes.number.isRequired,
    setUnloadingTime: PropTypes.func.isRequired,
    setIsHovered: PropTypes.func.isRequired,
    pickupAccepted: PropTypes.bool.isRequired,
  dropoffAccepted: PropTypes.bool.isRequired,
  };
  

export default BookingForm;