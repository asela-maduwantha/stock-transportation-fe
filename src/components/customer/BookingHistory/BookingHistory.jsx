import React, { useState, useEffect } from 'react';
import { Card, Tag, Rate, Space, Select, DatePicker, Row, Col, Empty, Spin, Button, Pagination, Modal, Input } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, CarOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { RangePicker } = DatePicker;

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const pageSize = 6;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://stocktrans.azurewebsites.net/customer/myBookings/d5b83319-e344-4edb-83b2-edc6890ef5b0');
        const bookingsWithLocations = await Promise.all(response.data.map(async booking => {
          const startLocation = await getLocationName(booking.startLat, booking.startLong);
          const destLocation = await getLocationName(booking.destLat, booking.destLong);
          return { ...booking, startLocation, destLocation };
        }));
        setBookings(bookingsWithLocations);
        setFilteredBookings(bookingsWithLocations);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBookings();
  }, []);
  

  const getLocationName = (lat, long) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng: long } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(status);
        }
      });
    });
  };

  const applyFilters = () => {
    let result = bookings;

    if (statusFilter !== 'all') {
      result = result.filter(booking => 
        booking.isCancelled ? 'cancelled' : (booking.isPaid ? 'completed' : 'upcoming') === statusFilter
      );
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange;
      result = result.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= startDate.startOf('day').toDate() && bookingDate <= endDate.endOf('day').toDate();
      });
    }

    if (vehicleFilter !== 'all') {
      result = result.filter(booking => booking.vehicle.type === vehicleFilter);
    }

    setFilteredBookings(result);
    setCurrentPage(1);
  };

  const getStatusTag = (booking) => {
    if (booking.isCancelled) return <Tag color="red">Cancelled</Tag>;
    if (booking.isPaid) return <Tag color="green">Completed</Tag>;
    return <Tag color="blue">Upcoming</Tag>;
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString()} ${time}`;
  };

  const handlePayBalance = (bookingId) => {
    // Implement payment logic here
    console.log(`Paying balance for booking ${bookingId}`);
  };

  const handleRateBooking = (bookingId) => {
    setCurrentBookingId(bookingId);
    setRatingModalVisible(true);
  };

  const handleSubmitRating = () => {
    // Implement rating submission logic here
    console.log(`Submitting rating ${currentRating} for booking ${currentBookingId}`);
    setRatingModalVisible(false);
    setCurrentRating(0);
    setCurrentBookingId(null);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (bookings.length === 0) {
    return <Empty description="No bookings found" />;
  }

  const paginatedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Booking History</h1>
      
      <Space wrap style={{ marginBottom: '24px', justifyContent: 'center', width: '100%' }}>
        <Select 
          defaultValue="all" 
          style={{ width: 120 }} 
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="all">All Status</Option>
          <Option value="upcoming">Upcoming</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
        
        <RangePicker onChange={(dates) => setDateRange(dates)} />
        
        <Select
          defaultValue="all"
          style={{ width: 120 }}
          onChange={(value) => setVehicleFilter(value)}
        >
          <Option value="all">All Vehicles</Option>
          <Option value="Freezer">Freezer</Option>
          <Option value="Lorry">Lorry</Option>
        </Select>
        
        <Button type="primary" onClick={applyFilters}>
          Apply Filters
        </Button>
      </Space>

      <Row gutter={[24, 24]}>
        {paginatedBookings.map((booking) => (
          <Col xs={24} sm={12} lg={8} key={booking.id}>
            <Card 
              title={booking.vehicle.type}
              extra={getStatusTag(booking)}
              style={{ height: '100%' }}
              hoverable
            >
              <img 
                src={booking.vehicle.photoUrl} 
                alt={booking.vehicle.type} 
                style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '16px', borderRadius: '8px' }} 
              />
              <p><CalendarOutlined style={{ marginRight: '8px' }} />{formatDateTime(booking.bookingDate, booking.pickupTime)}</p>
              <p><EnvironmentOutlined style={{ marginRight: '8px' }} />From: {booking.startLocation}</p>
              <p><EnvironmentOutlined style={{ marginRight: '8px' }} />To: {booking.destLocation}</p>
              <p><ClockCircleOutlined style={{ marginRight: '8px' }} />Travel Time: {booking.travellingTime.toFixed(2)} min</p>
              <p><CarOutlined style={{ marginRight: '8px' }} />Capacity: {booking.vehicle.capacity} {booking.vehicle.capacityUnit}</p>
              <p><DollarOutlined style={{ marginRight: '8px' }} />Charge: LKR {booking.vehicleCharge.toFixed(2)}</p>
              
              {!booking.isPaid && !booking.isCancelled && (
                <Button type="primary" onClick={() => handlePayBalance(booking.id)} style={{ marginTop: '16px', width: '100%' }}>
                  Pay Balance
                </Button>
              )}
              
              {booking.isPaid && (
                <Button type="default" onClick={() => handleRateBooking(booking.id)} style={{ marginTop: '16px', width: '100%' }}>
                  Rate
                </Button>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Pagination
        current={currentPage}
        total={filteredBookings.length}
        pageSize={pageSize}
        onChange={setCurrentPage}
        style={{ marginTop: '32px', textAlign: 'center' }}
      />

      <Modal
        title="Rate your booking"
        visible={ratingModalVisible}
        onOk={handleSubmitRating}
        onCancel={() => setRatingModalVisible(false)}
      >
        <Rate
          value={currentRating}
          onChange={setCurrentRating}
          style={{ fontSize: '32px', marginBottom: '16px' }}
        />
        <Input.TextArea
          rows={4}
          placeholder="Leave a comment (optional)"
        />
      </Modal>
    </div>
  );
};

export default BookingHistory;