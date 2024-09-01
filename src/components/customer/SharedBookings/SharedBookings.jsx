import React, { useState, useEffect } from 'react';
import { Card, Button, Space, DatePicker, Input, Row, Col, Tag, Empty, Spin, message } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, CarOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const SharedBookings = () => {
  const [sharedBookings, setSharedBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(null);
  const [areaFilter, setAreaFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSharedBookings();
  }, []);

  const fetchSharedBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://stocktrans.azurewebsites.net/customer/sharedBookings');
      setSharedBookings(response.data);
      setFilteredBookings(response.data);
    } catch (error) {
      console.error('Error fetching shared bookings:', error);
      message.error('Failed to fetch shared bookings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = sharedBookings;

    if (dateFilter) {
      result = result.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate.toDateString() === dateFilter.toDate().toDateString();
      });
    }

    if (areaFilter) {
      const lowercaseFilter = areaFilter.toLowerCase();
      result = result.filter(booking =>
        booking.nearbyCities.some(city => city.toLowerCase().includes(lowercaseFilter)) ||
        booking.vehicle.preferredArea.toLowerCase().includes(lowercaseFilter)
      );
    }

    setFilteredBookings(result);
  };

  const handleMakeBooking = (booking) => {
    navigate('/customer/shared-booking-details', { state: { booking } });
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Available Shared Bookings</h1>

      <Space style={{ marginBottom: '24px', width: '100%', justifyContent: 'center' }}>
        <DatePicker
          onChange={(date) => setDateFilter(date)}
          style={{ width: 200 }}
          placeholder="Filter by date"
        />
        <Search
          placeholder="Filter by area"
          onSearch={setAreaFilter}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={applyFilters}>Apply Filters</Button>
      </Space>

      {filteredBookings.length === 0 ? (
        <Empty description="No shared bookings found" />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredBookings.map((booking) => (
            <Col xs={24} sm={12} lg={8} key={booking.id}>
              <Card
                title={`${booking.vehicle.type} - ${booking.vehicle.preferredArea}`}
                extra={<Tag color="blue">{booking.freeCapacity > 0 ? 'Available' : 'Full'}</Tag>}
                style={{ height: '100%' }}
                hoverable
              >
                <img
                  src={booking.vehicle.photoUrl}
                  alt={booking.vehicle.type}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '16px', borderRadius: '8px' }}
                />
                <p><CalendarOutlined style={{ marginRight: '8px' }} />{new Date(booking.bookingDate).toLocaleDateString()}</p>
                <p><ClockCircleOutlined style={{ marginRight: '8px' }} />{booking.pickupTime} - {booking.endTime}</p>
                <p><CarOutlined style={{ marginRight: '8px' }} />
                  Capacity: {booking.vehicle.capacity} {booking.vehicle.capacityUnit} 
                  (Free: {booking.freeCapacity} {booking.vehicle.capacityUnit})
                </p>
                <p><EnvironmentOutlined style={{ marginRight: '8px' }} />
                  Nearby: {booking.nearbyCities.join(', ')}
                </p>
                <Button 
                  type="primary" 
                  onClick={() => handleMakeBooking(booking)} 
                  disabled={booking.freeCapacity <= 0}
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  Make Shared Booking
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default SharedBookings;
