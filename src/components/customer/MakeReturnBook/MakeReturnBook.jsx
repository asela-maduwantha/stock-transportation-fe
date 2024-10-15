import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, message, Typography, Space, InputNumber, Switch } from 'antd';
import { CarOutlined, EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import { DistanceMatrixService } from '@react-google-maps/api';
import GoogleMapsLoader from '../../../services/GoogleMapsLoader'; // Adjust the import path as needed
import httpService from '../../../services/httpService'; // Import the configured Axios instance

const { Text, Title } = Typography;

const MakeReturnBook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vehicleData, startCoordinates, destCoordinates } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [charges, setCharges] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const [unloadingTime, setUnloadingTime] = useState(0);
  const [willingToShare, setWillingToShare] = useState(false);

  const fetchCharges = async (distance, vehicleId) => {
    try {
      const chargeResponse = await httpService.post('customer/calCharge', {
        vehicleId: vehicleId,
        distance: distance,
        returnTrip: true
      });
      return chargeResponse.data;
    } catch (error) {
      console.error('Error calculating charges:', error);
      message.error('Failed to calculate charges');
      return null;
    }
  };

  const prepareBookingData = ( travellingTime, chargesData, vehicleData, startCoordinates, destCoordinates) => {
    return {
      bookingDate: new Date().toISOString(),
      pickupTime: new Date().toISOString(),
      loadingTime: 0,
      unloadingTime: 0,
      startLong: startCoordinates.lng,
      startLat: startCoordinates.lat,
      destLong: destCoordinates.lng,
      destLat: destCoordinates.lat,
      travellingTime: travellingTime,
      vehicleCharge: chargesData.vehicleCharge,
      serviceCharge: chargesData.serviceCharge,
      loadingCapacity: vehicleData.capacity,
      isReturnTrip: true,
      willingToShare: false,
      avgHandlingTime: 0,
      status: "upcoming",
      vehicleId: vehicleData.id,
      customerId: localStorage.getItem('customerId')
    };
  };

  useEffect(() => {
    
    if (!vehicleData || !startCoordinates || !destCoordinates) {
      message.error('Missing required booking information');
      navigate('/customer/available-return-trips');
      return;
    }

  }, [vehicleData, startCoordinates, destCoordinates, navigate]);

  const handleDistanceMatrixLoad = async (response) => {
    if (response.rows[0].elements[0].status === "OK") {
      const distance = response.rows[0].elements[0].distance.value / 1000;
      const travellingTime = response.rows[0].elements[0].duration.value / 60;

      const chargesData = await fetchCharges(distance, vehicleData.id);
      if (chargesData) {
        setCharges(chargesData); 
        const newBookingData = prepareBookingData( travellingTime, chargesData, vehicleData, startCoordinates, destCoordinates);
        setBookingData(newBookingData);
      }
    } else {
      message.error('Failed to calculate distance and travel time');
    }
    
  };

  const handleConfirmBooking = async () => {
    if (!bookingData) {
      message.error('Booking data is not available. Please try again.');
      return;
    }

    try {
      setLoading(true);
      const updatedBookingData = {
        ...bookingData,
        loadingTime,
        unloadingTime,
        willingToShare,
        avgHandlingTime: (loadingTime + unloadingTime) / 2
      };

      const response = await httpService.post('customer/booking', updatedBookingData);

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
    <GoogleMapsLoader>
      <DistanceMatrixService
        options={{
          destinations: [{ lat: destCoordinates.lat, lng: destCoordinates.lng }],
          origins: [{ lat: startCoordinates.lat, lng: startCoordinates.lng }],
          travelMode: "DRIVING",
        }}
        callback={handleDistanceMatrixLoad}
      />
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
            <Text>From: {bookingData.startLat}, {bookingData.startLong}</Text>
            <br />
            <Text>To: {bookingData.destLat}, {bookingData.destLong}</Text>
            <br />
            <Text>Estimated Travel Time: {Math.round(bookingData.travellingTime)} minutes</Text>
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
    </GoogleMapsLoader>
  );
};

export default MakeReturnBook;
