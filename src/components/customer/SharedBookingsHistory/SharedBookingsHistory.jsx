import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tag, Rate, Space, Row, Col, Empty, Spin, Button, Modal, Input, message, Radio, Tabs, DatePicker } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, CarOutlined, DollarOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const SharedBookingsHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [review, setReview] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelledReasons, setCancelledReasons] = useState({});
  const [dateRange, setDateRange] = useState([null, null]);
  const navigate = useNavigate();

  const cancelReasons = [
    'Change of plans',
    'Found alternative transportation',
    'Unexpected circumstances',
    'Booking error',
    'Other'
  ];

  const getLocationName = useCallback((lat, long) => {
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
  }, []);

  const fetchCancelledReason = useCallback(async (bookingId) => {
    try {
      const response = await httpService.get(`/common/cancelledReason/${bookingId}?type=shared`);
      return response.data.reason;
    } catch (error) {
      console.error('Error fetching cancelled reason:', error);
      return 'Unable to fetch reason';
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const customerId = localStorage.getItem('customerId');
      const response = await httpService.get(`/customer/customerSharedBooking/${customerId}`);
      const bookingsWithLocations = await Promise.all(response.data.map(async booking => {
        const startLocation = await getLocationName(booking.startLat, booking.startLong);
        const destLocation = await getLocationName(booking.destLat, booking.destLong);
        return { ...booking, startLocation, destLocation };
      }));
      setBookings(bookingsWithLocations);
      setFilteredBookings(bookingsWithLocations);
      
      const cancelledBookings = bookingsWithLocations.filter(booking => booking.status === 'canceled');
      const cancelledReasonsData = await Promise.all(cancelledBookings.map(async booking => {
        const reason = await fetchCancelledReason(booking.id);
        return { [booking.id]: reason };
      }));
      setCancelledReasons(Object.assign({}, ...cancelledReasonsData));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchCancelledReason, getLocationName]);

  const filterBookings = useCallback(() => {
    if (!dateRange[0] || !dateRange[1]) {
      setFilteredBookings(bookings);
      return;
    }

    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= dateRange[0].startOf('day') && bookingDate <= dateRange[1].endOf('day');
    });

    setFilteredBookings(filteredBookings);
  }, [bookings, dateRange]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    filterBookings();
  }, [filterBookings]);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const getStatusTag = useCallback((status) => {
    const statusColors = {
      upcoming: 'blue',
      complete: 'green',
      canceled: 'red'
    };
    return <Tag color={statusColors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
  }, []);

  const formatDateTime = useCallback((date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }, []);

  const handleRateBooking = useCallback((bookingId, driverId) => {
    setCurrentBookingId(bookingId);
    setCurrentDriverId(driverId);
    setRatingModalVisible(true);
  }, []);

  const handleSubmitRating = useCallback(async () => {
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
        bookingType: 'shared'
      });
      
      if (response.status === 200) {
        message.success('Rating submitted successfully');
        setRatingModalVisible(false);
        setCurrentRating(0);
        setReview('');
        setCurrentBookingId(null);
        setCurrentDriverId(null);
        
        setBookings(prevBookings => prevBookings.map(booking => 
          booking.id === currentBookingId ? {...booking, rated: true} : booking
        ));
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      message.error('Failed to submit rating');
    }
  }, [currentRating, review, currentDriverId, currentBookingId]);

  const handleCancelBooking = useCallback((bookingId) => {
    setCurrentBookingId(bookingId);
    setCancelModalVisible(true);
  }, []);

  const confirmCancelBooking = useCallback(async () => {
    if (!cancelReason) {
      message.error('Please select a reason for cancellation');
      return;
    }
    try {
      await httpService.put(`/customer/cancelSharedBooking/${currentBookingId}`, { reason: cancelReason });
      message.success('Booking cancelled successfully');
      setBookings(prevBookings => prevBookings.map(booking => 
        booking.id === currentBookingId ? {...booking, status: 'canceled'} : booking
      ));
      setCancelModalVisible(false);
      setCancelReason('');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      message.error('Failed to cancel booking');
    }
  }, [cancelReason, currentBookingId, fetchBookings]);

  const handleViewRideStatus = useCallback((bookingId) => {
    localStorage.setItem('sharedBookingId', bookingId);
    navigate('/customer/pickup-stock', { state: { bookingId, bookingType: 'shared' } });
  }, [navigate]);

  const renderBookingCard = useCallback((booking, isToday = false) => (
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
      <p><CalendarOutlined style={{ marginRight: '8px' }} />{formatDateTime(booking.date)}</p>
      <p><EnvironmentOutlined style={{ marginRight: '8px' }} />From: {booking.startLocation}</p>
      <p><EnvironmentOutlined style={{ marginRight: '8px' }} />To: {booking.destLocation}</p>
      <p><ClockCircleOutlined style={{ marginRight: '8px' }} />Travel Time: {booking.travellingTime.toFixed(2)} min</p>
      <p><CarOutlined style={{ marginRight: '8px' }} />Capacity: {booking.vehicle.capacity} {booking.vehicle.capacityUnit}</p>
      <p><DollarOutlined style={{ marginRight: '8px' }} />Charge: LKR {booking.vehicleCharge.toFixed(2)}</p>
      {booking.status === 'complete' && booking.driver && (
        <p><UserOutlined style={{ marginRight: '8px' }} />Driver: {`${booking.driver.firstName} ${booking.driver.lastName}`}</p>
      )}
      {booking.status === 'canceled' && (
        <p><CloseCircleOutlined style={{ marginRight: '8px' }} />Cancellation Reason: {cancelledReasons[booking.id] || 'Loading...'}</p>
      )}
      
      <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
        {booking.status === 'upcoming' && (
          <>
            {isToday && (
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
  ), [getStatusTag, formatDateTime, cancelledReasons, handleCancelBooking, handleRateBooking, handleViewRideStatus]);

  const renderBookingList = useCallback((bookings, isToday = false) => (
    <Row gutter={[24, 24]}>
      {bookings.map((booking) => (
        <Col xs={24} sm={12} lg={8} key={booking.id}>
          {renderBookingCard(booking, isToday)}
        </Col>
      ))}
    </Row>
  ), [renderBookingCard]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (filteredBookings.length === 0) {
    return <Empty description="No bookings found" />;
  }

  const today = new Date().setHours(0, 0, 0, 0);
  const todayBookings = filteredBookings.filter(booking => 
    new Date(booking.date).setHours(0, 0, 0, 0) === today && booking.status === 'upcoming'
  );
  const upcomingBookings = filteredBookings.filter(booking => 
     booking.status === 'upcoming'
  );
  const canceledBookings = filteredBookings.filter(booking => booking.status === 'canceled');
  const pastBookings = filteredBookings.filter(booking => booking.status === 'complete'
  );

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Shared Booking History</h1>
      
      <Space direction="vertical" style={{ width: '100%', marginBottom: '24px' }}>
        <RangePicker
          onChange={handleDateRangeChange}
          style={{ width: '100%' }}
        />
      </Space>

      <Tabs defaultActiveKey="today">
        <TabPane tab="Today's Bookings" key="today">
          {todayBookings.length > 0 ? renderBookingList(todayBookings, true) : <Empty description="No bookings for today" />}
        </TabPane>
        <TabPane tab="Upcoming Bookings" key="upcoming">
          {upcomingBookings.length > 0 ? renderBookingList(upcomingBookings) : <Empty description="No upcoming bookings" />}
        </TabPane>
        <TabPane tab="Canceled Bookings" key="canceled">
          {canceledBookings.length > 0 ? renderBookingList(canceledBookings) : <Empty description="No canceled bookings" />}
        </TabPane>
        <TabPane tab="Past Bookings" key="past">
          {pastBookings.length > 0 ? renderBookingList(pastBookings) : <Empty description="No past bookings" />}
        </TabPane>
        <TabPane tab="All Bookings" key="all">
          {renderBookingList(filteredBookings)}
        </TabPane>
      </Tabs>

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

export default SharedBookingsHistory;