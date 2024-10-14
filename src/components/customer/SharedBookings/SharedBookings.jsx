import React, { useState, useEffect } from 'react';
import { Calendar, Modal, Button, Tag, Row, Col, Spin, message, Tooltip, Progress } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, CarOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const SharedBookings = () => {
  const [sharedBookings, setSharedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSharedBookings();
  }, []);

  const fetchSharedBookings = async () => {
    try {
      setLoading(true);
      const response = await httpService.get('/customer/sharedBookings');
      setSharedBookings(response.data);
    } catch (error) {
      console.error('Error fetching shared bookings:', error);
      message.error('Failed to fetch shared bookings');
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDate = (date) => {
    return sharedBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.toDateString() === date.toDate().toDateString();
    });
  };

  const dateCellRender = (value) => {
    const bookingsForDate = getBookingsForDate(value);
    if (bookingsForDate.length === 0) return null;

    return (
      <div style={{ height: '100%', position: 'relative' }}>
        <div style={{ fontSize: '12px', padding: '4px' }}>
          <CarOutlined /> {bookingsForDate.length}
          <ul style={{ paddingLeft: '15px', margin: 0 }}>
            {bookingsForDate.map((booking) => {
              const availableCapacity = booking.freeCapacity * booking.vehicle.capacity;
              const totalCapacity = booking.vehicle.capacity;
              const availablePercentage = (availableCapacity / totalCapacity) * 100;

              return (
                <li key={booking.id} style={{ listStyleType: 'none', marginBottom: '8px' }}>
                  <Tooltip
                    title={`${booking.vehicle.type} - ${availableCapacity} ${booking.vehicle.capacityUnit} available (${availablePercentage.toFixed(2)}% free)`}
                  >
                    <span>
                      {booking.vehicle.type} - {booking.nearbyCities[0]}
                    </span>
                    <br />
                    <Progress
                      percent={availablePercentage}
                      showInfo={false}
                      strokeColor={{
                        '0%': '#fdc540', // Yellow for available space
                        '100%': '#fdc540',
                      }}
                      trailColor="#DC143C" // Red for used space
                      status="active"
                    />
                    <span>{availableCapacity} {booking.vehicle.capacityUnit} Available</span>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsModalVisible(true);
  };

  const handleMakeBooking = (booking) => {
    navigate('/customer/shared-booking-details', { state: { booking } });
  };

  const renderBookingDetails = () => {
    if (!selectedDate) return null;

    const bookingsForDate = getBookingsForDate(selectedDate);

    return (
      <div>
        <h2>{selectedDate.format('MMMM D, YYYY')}</h2>
        {bookingsForDate.map((booking) => (
          <div key={booking.id} style={{ marginBottom: '20px', border: '1px solid #f0f0f0', padding: '16px', borderRadius: '8px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <img
                  src={booking.vehicle.photoUrl}
                  alt={booking.vehicle.type}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
                />
              </Col>
              <Col xs={24} sm={16}>
                <h3>{booking.vehicle.type} - {booking.nearbyCities[0]}</h3>
                <Tag color={booking.freeCapacity > 0 ? 'green' : 'red'}>
                  {booking.freeCapacity * booking.vehicle.capacity > 0 ? 'Available' : 'Full'}
                </Tag>
                <p><ClockCircleOutlined style={{ marginRight: '8px' }} />{booking.pickupTime} - {booking.endTime}</p>
                <p><CarOutlined style={{ marginRight: '8px' }} />
                  Total Capacity: {booking.vehicle.capacity} {booking.vehicle.capacityUnit}
                </p>
                <p><UserOutlined style={{ marginRight: '8px' }} />
                  Available Capacity: {booking.freeCapacity * booking.vehicle.capacity} {booking.vehicle.capacityUnit}
                </p>
                <p><EnvironmentOutlined style={{ marginRight: '8px' }} />
                  Nearby: {booking.nearbyCities.join(', ')}
                </p>
                <Button 
                  type="primary" 
                  onClick={() => handleMakeBooking(booking)} 
                  disabled={booking.freeCapacity <= 0}
                >
                  Make Shared Booking
                </Button>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Available Shared Bookings</h1>

      {/* Legend for the progress bar colors */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Tag color="#fdc540">Available Space</Tag>
        <Tag color="#DC143C">Used Space</Tag>
      </div>

      <Calendar 
        dateCellRender={dateCellRender} 
        onSelect={handleDateSelect}
      />

      <Modal
        title="Booking Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderBookingDetails()}
      </Modal>
    </div>
  );
};

export default SharedBookings;
