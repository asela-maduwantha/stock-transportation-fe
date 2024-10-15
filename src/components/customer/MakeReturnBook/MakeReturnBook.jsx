import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, message, Typography, Space, InputNumber, Switch } from 'antd';
import { CarOutlined, EnvironmentOutlined, DollarOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Text, Title } = Typography;

const MakeReturnBook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vehicleData, startCoordinates, destCoordinates, distance, duration, charges, pickupTime } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [unloadingTime, setUnloadingTime] = useState(0);
  const [willingToShare, setWillingToShare] = useState(false);

  const handleConfirmBooking = async () => {
    if (!vehicleData || !startCoordinates || !destCoordinates) {
      message.error('Missing required booking information');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        bookingDate: new Date().toISOString(),
        pickupTime: pickupTime,
        loadingTime,
        unloadingTime,
        startLong: startCoordinates.lng,
        startLat: startCoordinates.lat,
        destLong: destCoordinates.lng,
        destLat: destCoordinates.lat,
        travellingTime: duration,
        vehicleCharge: charges.vehicleCharge,
        serviceCharge: charges.serviceCharge,
        loadingCapacity: vehicleData.capacity,
        isReturnTrip: true,
        willingToShare,
        avgHandlingTime: (loadingTime + unloadingTime) / 2,
        status: "upcoming",
        vehicleId: vehicleData.id,
        customerId: localStorage.getItem('customerId')
      };

      const response = await httpService.post('customer/booking', bookingData);
      message.success(`Booking confirmed! Booking ID: ${response.data.bookingId}`);
      navigate('/booking-confirmation', { state: { bookingId: response.data.bookingId } });
    } catch (error) {
      console.error('Error making booking:', error);
      message.error('An error occurred while making the booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Confirm Return Trip Booking</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title={<><CarOutlined /> Vehicle Details</>}>
          <Text>Type: {vehicleData.type}</Text>
          <br />
          <Text>Registration: {vehicleData.regNo}</Text>
          <br />
          <Text>Capacity: {vehicleData.capacity} {vehicleData.capacityUnit}</Text>
        </Card>

        <Card title={<><EnvironmentOutlined /> Trip Details</>}>
          <Text>From: {startCoordinates.lat}, {startCoordinates.lng}</Text>
          <br />
          <Text>To: {destCoordinates.lat}, {destCoordinates.lng}</Text>
          <br />
          <Text>Distance: {distance}</Text>
          <br />
          <Text>Estimated Travel Time: {duration}</Text>
        </Card>

        <Card title={<><CalendarOutlined /> Pickup Details</>}>
          <Text><ClockCircleOutlined /> Pickup Time: {new Date(pickupTime).toLocaleString()}</Text>
        </Card>

        <Card title={<><DollarOutlined /> Charges</>}>
          <Text>Vehicle Charge: LKR {charges.vehicleCharge}</Text>
          <br />
          <Text>Service Charge: LKR {charges.serviceCharge}</Text>
          <br />
          <Text strong>Total: LKR {charges.total}</Text>
          <br />
          <Text type="secondary">Advance Payment Required: LKR {charges.advancePayment}</Text>
        </Card>

        <Space direction="vertical">
          <Text>Loading Time (minutes):</Text>
          <InputNumber min={0} value={loadingTime} onChange={setLoadingTime} />
        </Space>

        <Space direction="vertical">
          <Text>Unloading Time (minutes):</Text>
          <InputNumber min={0} value={unloadingTime} onChange={setUnloadingTime} />
        </Space>

        <Space>
          <Text>Willing to Share:</Text>
          <Switch checked={willingToShare} onChange={setWillingToShare} />
        </Space>

        <Button type="primary" onClick={handleConfirmBooking} loading={loading}>
          Confirm and Proceed to Payment
        </Button>
      </Space>
    </div>
  );
};

export default MakeReturnBook;