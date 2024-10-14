import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  Row,
  Col,
  Checkbox,
  Popover,
  Space,
  Divider,
  Statistic
} from 'antd';
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CarOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { GoogleMap, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';

const { Title, Text } = Typography;
const { Option } = Select;

const CostCalculator = ({ selectedVehicle }) => {
  const [form] = Form.useForm();
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropAutocomplete, setDropAutocomplete] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(0);
  const [formattedDistance, setFormattedDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
  const [cost, setCost] = useState(null);

  const onPickupLoad = (autocomplete) => {
    setPickupAutocomplete(autocomplete);
  };

  const onDropLoad = (autocomplete) => {
    setDropAutocomplete(autocomplete);
  };

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete) {
      const place = pickupAutocomplete.getPlace();
      setPickupLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
      });
      form.setFieldsValue({ pickupAddress: place.formatted_address });
    }
  };

  const onDropPlaceChanged = () => {
    if (dropAutocomplete) {
      const place = dropAutocomplete.getPlace();
      setDropLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
      });
      form.setFieldsValue({ dropAddress: place.formatted_address });
    }
  };

  const calculateRoute = useCallback(() => {
    if (pickupLocation && dropLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(pickupLocation.lat, pickupLocation.lng),
          destination: new window.google.maps.LatLng(dropLocation.lat, dropLocation.lng),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const routeDistance = result.routes[0].legs[0].distance.value / 1000;
            setDistance(routeDistance);
            setFormattedDistance(result.routes[0].legs[0].distance.text);
            setTravelTime(result.routes[0].legs[0].duration.text);
          }
        }
      );
    }
  }, [pickupLocation, dropLocation]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const calculateCost = (values) => {
    const { returnTrip, loadingTime, unloadingTime } = values;
    const baseCost = distance * selectedVehicle.chargePerKm;
    const loadingCost = (loadingTime / 60) * selectedVehicle.chargePerKm * 10; // Assuming 10km/h for loading/unloading
    const unloadingCost = (unloadingTime / 60) * selectedVehicle.chargePerKm * 10;
    let totalCost = baseCost + loadingCost + unloadingCost;
    if (returnTrip) {
      totalCost *= 2;
    }
    setCost(totalCost.toFixed(2));
  };

  const onFinish = (values) => {
    calculateCost(values);
  };

  return (
    <Card title={<Title level={3}><CarOutlined /> Cost Calculator</Title>}>
      <Form form={form} name="cost_calculator" onFinish={onFinish} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="pickupAddress"
              label={<Text strong>Pickup Location</Text>}
              rules={[{ required: true, message: 'Please enter pickup location' }]}
            >
              <Autocomplete onLoad={onPickupLoad} onPlaceChanged={onPickupPlaceChanged}>
                <Input prefix={<EnvironmentOutlined />} placeholder="Enter pickup location" />
              </Autocomplete>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dropAddress"
              label={<Text strong>Drop-off Location</Text>}
              rules={[{ required: true, message: 'Please enter drop-off location' }]}
            >
              <Autocomplete onLoad={onDropLoad} onPlaceChanged={onDropPlaceChanged}>
                <Input prefix={<EnvironmentOutlined />} placeholder="Enter drop-off location" />
              </Autocomplete>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="loadingTime"
              label={<Text strong>Loading Time</Text>}
              rules={[{ required: true, message: 'Please select loading time' }]}
            >
              <Select prefix={<ClockCircleOutlined />}>
                <Option value={15}>15 mins</Option>
                <Option value={30}>30 mins</Option>
                <Option value={60}>1 hour</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="unloadingTime"
              label={<Text strong>Unloading Time</Text>}
              rules={[{ required: true, message: 'Please select unloading time' }]}
            >
              <Select prefix={<ClockCircleOutlined />}>
                <Option value={15}>15 mins</Option>
                <Option value={30}>30 mins</Option>
                <Option value={60}>1 hour</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="returnTrip"
              label={<Text strong>Return Trip</Text>}
              valuePropName="checked"
            >
              <Checkbox>
                <Space>
                  <SwapOutlined />
                  <Text>Return Trip</Text>
                  <Popover
                    content="A return trip allows you to book the vehicle for a round trip, potentially saving on overall costs."
                    title="Return Trip"
                    trigger="click"
                  >
                    <a href="#">More Info</a>
                  </Popover>
                </Space>
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Calculate Cost
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <div style={{ height: '400px', width: '100%', marginBottom: '16px' }}>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={
            pickupLocation && dropLocation
              ? {
                  lat: (pickupLocation.lat + dropLocation.lat) / 2,
                  lng: (pickupLocation.lng + dropLocation.lng) / 2,
                }
              : { lat: 6.9271, lng: 79.8612 } // Default to Sri Lanka coordinates
          }
          zoom={10}
        >
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Distance"
                value={formattedDistance || 'N/A'}
                prefix={<EnvironmentOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Estimated Travel Time"
                value={travelTime || 'N/A'}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
        <Card>
          <Space direction="vertical">
            <Text strong>Selected Vehicle: {selectedVehicle.type}</Text>
            <Text strong>Capacity: {selectedVehicle.capacity} {selectedVehicle.capacityUnit}</Text>
            <Text strong>Charge per km: LKR {selectedVehicle.chargePerKm}</Text>
          </Space>
        </Card>
        {cost !== null && (
          <Card>
            <Statistic
              title="Estimated Cost"
              value={cost}
              prefix={<DollarOutlined />}
              suffix="LKR"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        )}
      </Space>
    </Card>
  );
};

CostCalculator.propTypes = {
  selectedVehicle: PropTypes.shape({
    type: PropTypes.string.isRequired,
    capacity: PropTypes.number.isRequired,
    capacityUnit: PropTypes.string.isRequired,
    chargePerKm: PropTypes.number.isRequired,
  }).isRequired,
};

export default CostCalculator;