import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Typography, Button, Spin, Empty, message } from 'antd';
import { CarOutlined, ShareAltOutlined, LoadingOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Title, Text } = Typography;

const PendingBalancePayments = () => {
  const [payments, setPayments] = useState({ original: [], shared: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      message.error('Customer ID not found');
      return;
    }

    const fetchPendingPayments = async () => {
      try {
        setLoading(true);
        const response = await httpService.get(`/customer/balPaymentsPending/${customerId}`);
        const updatedPayments = await Promise.all(
          Object.entries(response.data).map(async ([key, bookings]) => {
            const updatedBookings = await Promise.all(
              bookings.map(async (booking) => {
                const startAddress = await fetchAddress(booking.startLat, booking.startLong);
                const destAddress = await fetchAddress(booking.destLat, booking.destLong);
                return { ...booking, startAddress, destAddress };
              })
            );
            return [key, updatedBookings];
          })
        );
        setPayments(Object.fromEntries(updatedPayments));
      } catch (error) {
        console.error('Error fetching pending payments:', error);
        message.error('Failed to fetch pending payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPayments();
  }, []);

  const fetchAddress = async (lat, long) => {
    try {
      const response = await httpService.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`);
      return response.data.display_name;
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Address not available';
    }
  };

  const handlePaymentClick = (booking) => {
    navigate('/customer/pay-balance', {
      state: {
        bookingId: booking.id,
        bookingType: booking.type
      }
    });
  };

  const renderBookingList = (bookings, type) => (
    <List
      itemLayout="vertical"
      dataSource={bookings}
      renderItem={(booking) => (
        <List.Item>
          <Card
            style={{ width: '100%' }}
            hoverable
            extra={
              <Button
                type="primary"
                style={{ backgroundColor: '#fdb940' }}
                onClick={() => handlePaymentClick(booking)}
              >
                Pay Balance
              </Button>
            }
          >
            <List.Item.Meta
              avatar={type === 'original' ? <CarOutlined /> : <ShareAltOutlined />}
              title={`Booking ID: ${booking.id}`}
              description={`Date: ${new Date(booking.bookingDate).toLocaleDateString()}`}
            />
            <div>
              <Text strong>Pickup Time:</Text> {booking.pickupTime}<br />
              <Text strong>Travel Time:</Text> {booking.travellingTime.toFixed(2)} minutes<br />
              <Text strong>Loading Time:</Text> {booking.loadingTime.toFixed(2)} minutes<br />
              <Text strong>Unloading Time:</Text> {booking.unloadingTime.toFixed(2)} minutes<br />
              <Text strong>Loading Capacity:</Text> {booking.loadingCapacity || booking.loadingCapacitiy || 'N/A'}<br />
              <Text strong>Start Address:</Text> {booking.startAddress}<br />
              <Text strong>Destination Address:</Text> {booking.destAddress}<br />
              {booking.isReturnTrip !== undefined && (
                <><Text strong>Return Trip:</Text> {booking.isReturnTrip ? 'Yes' : 'No'}<br /></>
              )}
              {booking.willingToShare !== undefined && (
                <><Text strong>Willing to Share:</Text> {booking.willingToShare ? 'Yes' : 'No'}<br /></>
              )}
            </div>
          </Card>
        </List.Item>
      )}
    />
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Pending Balance Payments</Title>
      <Title level={3}>Original Bookings</Title>
      {payments.original.length > 0 ? (
        renderBookingList(payments.original, 'original')
      ) : (
        <Empty description="No pending original bookings" />
      )}
      <Title level={3} style={{ marginTop: '24px' }}>Shared Bookings</Title>
      {payments.shared.length > 0 ? (
        renderBookingList(payments.shared, 'shared')
      ) : (
        <Empty description="No pending shared bookings" />
      )}
    </div>
  );
};

export default PendingBalancePayments;