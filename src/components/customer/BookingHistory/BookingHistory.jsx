import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tag, Rate, Space, Select, DatePicker, Row, Col, Empty, Spin, Button, Pagination, Modal, Input, message, Radio } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, CarOutlined, DollarOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [review, setReview] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const pageSize = 6;
  const navigate = useNavigate();

  const cancelReasons = [
    'Change of plans',
    'Found alternative transportation',
    'Unexpected circumstances',
    'Booking error',
    'Other'
  ];

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const customerId = localStorage.getItem('customerId')
      const response = await httpService.get(`/customer/myBookings/${customerId}`);
      const bookingsWithLocations = await Promise.all(response.data.map(async booking => {
        const startLocation = await getLocationName(booking.startLat, booking.startLong);
        const destLocation = await getLocationName(booking.destLat, booking.destLong);
        return { ...booking, startLocation, destLocation };
      }));
      setBookings(bookingsWithLocations);
      setFilteredBookings(bookingsWithLocations);
      
      const today = new Date().setHours(0, 0, 0, 0);
      const todayBookings = bookingsWithLocations.filter(booking => 
        new Date(booking.bookingDate).setHours(0, 0, 0, 0) === today && booking.status === 'upcoming'
      );
      setTodayBookings(todayBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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

  const applyFilters = useCallback(() => {
    let result = bookings;

    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
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
  }, [bookings, statusFilter, dateRange, vehicleFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);
  const getStatusTag = (status) => {
    const statusColors = {
      upcoming: 'blue',
      complete: 'green',
      canceled: 'red'
    };
    return <Tag color={statusColors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString()} ${time}`;
  };

  const handleRateBooking = (bookingId, driverId) => {
    setCurrentBookingId(bookingId);
    setCurrentDriverId(driverId);
    setRatingModalVisible(true);
  };

  const handleSubmitRating = async () => {
    if (currentRating === 0) {
      message.error('Please select a rating');
      return;
    }

    try {
      const customerId = localStorage.getItem('customerId');
      const response = await httpService.post(`/customer/rate/${customerId}`, {
        rate: currentRating,
        review: review,
        driverId: currentDriverId,
        bookingId: currentBookingId,
        bookingType:'original'
      });
      
      if (response.status === 200) {
        message.success('Rating submitted successfully');
        setRatingModalVisible(false);
        setCurrentRating(0);
        setReview('');
        setCurrentBookingId(null);
        setCurrentDriverId(null);
        
        // Update the local state to reflect the rating
        setBookings(bookings.map(booking => 
          booking.id === currentBookingId ? {...booking, rated: true} : booking
        ));
        setFilteredBookings(filteredBookings.map(booking => 
          booking.id === currentBookingId ? {...booking, rated: true} : booking
        ));
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      message.error('Failed to submit rating');
    }
  };

  const handleCancelBooking = (bookingId) => {
    setCurrentBookingId(bookingId);
    setCancelModalVisible(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancelReason) {
      message.error('Please select a reason for cancellation');
      return;
    }
    try {
      await httpService.put(`/customer/cancelBooking/${currentBookingId}`, { reason: cancelReason });
      message.success('Booking cancelled successfully');
      setBookings(bookings.map(booking => 
        booking.id === currentBookingId ? {...booking, status: 'canceled'} : booking
      ));
      setFilteredBookings(filteredBookings.map(booking => 
        booking.id === currentBookingId ? {...booking, status: 'canceled'} : booking
      ));
      setTodayBookings(todayBookings.filter(booking => booking.id !== currentBookingId));
      setCancelModalVisible(false);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      message.error('Failed to cancel booking');
    }
  };

  const handleViewRideStatus = (bookingId) => {
    localStorage.setItem('bookingId', bookingId);
    navigate('/customer/pickup-stock', { state: { bookingId, bookingType: 'original' } });
  };

  const renderBookingCard = (booking, showRideStatusButton = false) => (
    <Card 
      title={booking.vehicle.type}
      extra={getStatusTag(booking.status)}
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
      {booking.status === 'complete' && booking.driver && (
        <p><UserOutlined style={{ marginRight: '8px' }} />Driver: {`${booking.driver.firstName} ${booking.driver.lastName}`}</p>
      )}
      
      <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
        {booking.status === 'upcoming' && (
          <>
            {showRideStatusButton && (
              <Button 
                type="default" 
                onClick={() => handleViewRideStatus(booking.id)} 
                style={{ width: '100%' }}
                className="hover-button"
              >
                View Ride Status
              </Button>
            )}
            <Button 
              type="primary" 
              danger 
              onClick={() => handleCancelBooking(booking.id)} 
              style={{ width: '100%' }}
              className="hover-button"
            >
              Cancel Booking
            </Button>
          </>
        )}
        
        {booking.status === 'complete' && booking.driver && !booking.rated && (
          <Button 
            type="default" 
            onClick={() => handleRateBooking(booking.id, booking.driver.id)} 
            style={{ width: '100%' }}
            className="hover-button"
          >
            Rate
          </Button>
        )}
      </Space>
    </Card>
  );

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
      
      {todayBookings.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Today&apos;s Bookings</h2>
          <Row gutter={[24, 24]}>
            {todayBookings.map((booking) => (
              <Col xs={24} sm={12} lg={8} key={booking.id}>
                {renderBookingCard(booking, true)}
              </Col>
            ))}
          </Row>
        </div>
      )}
      
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>All Bookings</h2>
      
      <Space wrap style={{ marginBottom: '24px', justifyContent: 'center', width: '100%' }}>
        <Select 
          defaultValue="all" 
          style={{ width: 120 }} 
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="all">All Status</Option>
          <Option value="upcoming">Upcoming</Option>
          <Option value="complete">Completed</Option>
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
      </Space>

      <Row gutter={[24, 24]}>
        {paginatedBookings.map((booking) => (
          <Col xs={24} sm={12} lg={8} key={booking.id}>
            {renderBookingCard(booking)}
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
        onCancel={() => {
          setRatingModalVisible(false);
          setCurrentRating(0);
          setReview('');
        }}
      >
        <Rate
          value={currentRating}
          onChange={setCurrentRating}
          style={{ fontSize: '32px', marginBottom: '16px' }}
        />
        <TextArea
          rows={4}
          placeholder="Leave a review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
      </Modal>

      <Modal
        title="Cancel Booking"
        visible={cancelModalVisible}
        onOk={confirmCancelBooking}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason('');
        }}
        okText="Yes, Cancel"
        cancelText="No"
        icon={<CloseCircleOutlined />}
      >
        <p>Are you sure you want to cancel this booking? Please note that your advance payment will not be refunded.</p>
        <Radio.Group
          onChange={(e) => setCancelReason(e.target.value)}
          value={cancelReason}
          style={{ marginTop: '16px', display: 'flex', flexDirection: 'column' }}
        >
        {cancelReasons.map((reason) => (
            <Radio key={reason} value={reason} style={{ marginBottom: '8px' }}>{reason}</Radio>
          ))}
        </Radio.Group>
      </Modal>
    </div>
  );
};

export default BookingHistory;