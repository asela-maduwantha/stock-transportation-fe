import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Space, Select, Divider } from 'antd';
import { CarOutlined, EnvironmentOutlined, DollarOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Text, Title } = Typography;
const { Option } = Select;

const MakeReturnBook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vehicleData, startCoordinates, destCoordinates, distance, duration, charges, pickupTime } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(15);
  const [unloadingTime, setUnloadingTime] = useState(15);

  const handleConfirmBooking = async () => {
    if (!vehicleData || !startCoordinates || !destCoordinates) {
      httpService.message.error('Missing required booking information');
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
        willingToShare: false,
        avgHandlingTime: (loadingTime + unloadingTime) / 2,
        status: "upcoming",
        vehicleId: vehicleData.id,
        customerId: localStorage.getItem('customerId')
      };

      const response = await httpService.post('customer/booking', bookingData);
      const bookingId = response.data.bookingId;
      localStorage.setItem('bookingId', bookingId);
      localStorage.setItem('bookingType', 'return');
      
      navigate('/payment', {
        state: {
          bookingId: bookingId,
          vehicle: vehicleData,
          pickupLocation: `${startCoordinates.lat}, ${startCoordinates.lng}`,
          dropLocation: `${destCoordinates.lat}, ${destCoordinates.lng}`,
          returnTrip: true,
          advanceAmount: charges.advancePayment,
          totalPrice: charges.total * 20 / 100,
          type: 'original'
        }
      });
    } catch (error) {
      console.error('Error making booking:', error);
      // Error handling is managed by httpService
    } finally {
      setLoading(false);
    }
  };

  const timeOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
  ];

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
          <Divider />
          <Text strong>Total: LKR {charges.total}</Text>
          <br />
          <Text type="secondary">Advance Payment Required: LKR {charges.advancePayment}</Text>
        </Card>

        <Card title={<><ClockCircleOutlined /> Loading and Unloading Time</>}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Loading Time:</Text>
            <Select
              style={{ width: '100%' }}
              value={loadingTime}
              onChange={(value) => setLoadingTime(value)}
            >
              {timeOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>

            <Text>Unloading Time:</Text>
            <Select
              style={{ width: '100%' }}
              value={unloadingTime}
              onChange={(value) => setUnloadingTime(value)}
            >
              {timeOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Space>
        </Card>

        <Button type="primary" onClick={handleConfirmBooking} loading={loading} block>
          Confirm and Proceed to Payment
        </Button>
      </Space>
    </div>
  );
};

export default MakeReturnBook;