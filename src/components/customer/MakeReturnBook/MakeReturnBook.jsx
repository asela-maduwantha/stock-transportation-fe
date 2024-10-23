import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Space, Select, Divider, Row, Col, message, Spin } from 'antd';
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
  const [startAddress, setStartAddress] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [addressesLoading, setAddressesLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (startCoordinates && destCoordinates) {
        setAddressesLoading(true);
        try {
          const [start, dest] = await Promise.all([
            getAddressFromCoordinates(startCoordinates),
            getAddressFromCoordinates(destCoordinates)
          ]);
          setStartAddress(start);
          setDestAddress(dest);
        } catch (error) {
          console.error('Error fetching addresses:', error);
          message.error('Failed to load addresses. Displaying coordinates instead.');
          setStartAddress(`${startCoordinates.lat}, ${startCoordinates.lng}`);
          setDestAddress(`${destCoordinates.lat}, ${destCoordinates.lng}`);
        } finally {
          setAddressesLoading(false);
        }
      }
    };
    fetchAddresses();
  }, [startCoordinates, destCoordinates]);

  const getAddressFromCoordinates = async (coordinates) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=AIzaSyCZai7VHlL_ERUPIvG3x-ztG6NJugx08Bo`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      throw new Error('No results found');
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  };


  const convertDurationToMinutes = (durationString) => {
    const [hours, minutes] = durationString.match(/\d+/g).map(Number);
    return hours * 60 + minutes;
  };

  const handleConfirmBooking = async () => {
    if (!vehicleData || !startCoordinates || !destCoordinates) {
      message.error('Missing required booking information');
      return;
    }

    try {
      setLoading(true);
      const durationInMinutes = convertDurationToMinutes(duration);
      const bookingData = {
        bookingDate: new Date().toISOString(),
        pickupTime: pickupTime,
        loadingTime,
        unloadingTime,
        startLong: startCoordinates.lng,
        startLat: startCoordinates.lat,
        destLong: destCoordinates.lng,
        destLat: destCoordinates.lat,
        travellingTime: durationInMinutes,
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
      const bookingId = response.data.id;
      localStorage.setItem('bookingId', bookingId);
      localStorage.setItem('bookingType', 'return');
      message.success('Return Booking created Successfully!')
      navigate('/payment', {
        state: {
          bookingId: bookingId,
          vehicle: vehicleData,
          pickupLocation: startAddress,
          dropLocation: destAddress,
          returnTrip: true,
          advanceAmount: charges.advancePayment,
          totalPrice: charges.total * 80 / 100,
          type: 'original'
        }
      });
    } catch (error) {
      console.error('Error making booking:', error);
      
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Confirm Return Trip Booking</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card title={<><CarOutlined /> Vehicle Details</>}>
              <Text>Type: {vehicleData.type}</Text>
              <br />
              <Text>Registration: {vehicleData.regNo}</Text>
              <br />
              <Text>Capacity: {vehicleData.capacity} {vehicleData.capacityUnit}</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card title={<><EnvironmentOutlined /> Trip Details</>}>
              {addressesLoading ? (
                <Spin tip="Loading addresses..." />
              ) : (
                <>
                  <Text>From: {startAddress}</Text>
                  <br />
                  <Text>To: {destAddress}</Text>
                  <br />
                  <Text>Distance: {distance}</Text>
                  <br />
                  <Text>Estimated Travel Time: {duration}</Text>
                </>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title={<><CalendarOutlined /> Pickup Details</>}>
              <Text><ClockCircleOutlined /> Pickup Time: {pickupTime}</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card title={<><DollarOutlined /> Charges</>}>
              <Text>Vehicle Charge: LKR {charges.vehicleCharge}</Text>
              <br />
              <Text>Service Charge: LKR {charges.serviceCharge}</Text>
              <Divider />
              <Text strong>
                Total: LKR {charges.total} (After Discount: LKR {(charges.total * 0.8).toFixed(2)})
              </Text>
              <br />
              <Text type="secondary">Advance Payment Required: LKR {(charges.advancePayment).toFixed(2)}</Text>
            </Card>
          </Col>
        </Row>

        <Card title={<><ClockCircleOutlined /> Loading and Unloading Time</>}>
          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>
        </Card>

        <Button type="primary" onClick={handleConfirmBooking} loading={loading} block>
          Confirm and Proceed to Payment
        </Button>
      </Space>
    </div>
  );
};

export default MakeReturnBook;