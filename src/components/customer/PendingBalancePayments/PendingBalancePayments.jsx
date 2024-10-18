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
        setPayments(response.data);
      } catch (error) {
        console.error('Error fetching pending payments:', error);
        message.error('Failed to fetch pending payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPayments();
  }, []);

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
      itemLayout="horizontal"
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
              <Text>Pickup Time: {booking.pickupTime}</Text>
              <br />
              <Text>Travel Time: {booking.travellingTime.toFixed(2)} minutes</Text>
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