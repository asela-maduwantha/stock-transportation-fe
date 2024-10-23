import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tag, Rate, Space, Row, Col, Empty, Spin, Button, Modal, Input, message, Radio, Tabs, DatePicker } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, CarOutlined, DollarOutlined, CloseCircleOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';
import axios from 'axios';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const BookingHistory = () => {
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

  const getLocationName = useCallback(async (lat, long) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const results = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng: long } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0]);
          } else {
            reject(status);
          }
        });
      });
      return results.formatted_address;
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Location unavailable';
    }
  }, []);

  const fetchCancelledReason = useCallback(async (bookingId, bookingType) => {
    try {
      const response = await httpService.get(`/common/cancelledReason/${bookingId}?type=${bookingType}`);
      return response.data.reason;
    } catch (error) {
      console.error('Error fetching cancelled reason:', error);
      return 'Unable to fetch reason';
    }
  }, []);

  const fetchDriverDetails = useCallback(async (bookingId, bookingType) => {
    try {
      const response = await httpService.get(`/common/upcomingDriver/${bookingId}?type=${bookingType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver details:', error);
      return null;
    }
  }, []);

  const fetchOwnerDetails = useCallback(async (bookingId, bookingType) => {
    try {
      const response = await httpService.get(`/common/owner/${bookingId}?type=${bookingType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner details:', error);
      return null;
    }
  }, []);

  const fetchRatingDetails = useCallback(async (bookingId, bookingType) => {
    try {
      const response = await axios.get(`https://stocktrans.azurewebsites.net/common/rates/${bookingId}?type=${bookingType}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { rate: 5, review: "" };
      }
      console.error('Error fetching rating details:', error);
      return { rate: 5, review: "" };
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const customerId = localStorage.getItem('customerId');
      const response = await httpService.get(`/customer/myBookings/${customerId}`);
      
      const bookingsWithDetails = await Promise.all(response.data.map(async booking => {
        try {
          const startLocation = await getLocationName(booking.startLat, booking.startLong);
          const destLocation = await getLocationName(booking.destLat, booking.destLong);
          const ownerDetails = await fetchOwnerDetails(booking.id, booking.type);
          let driverDetails = null;
          let ratingDetails = null;

          if (booking.status === 'upcoming') {
            driverDetails = await fetchDriverDetails(booking.id, booking.type);
          } else if (booking.status === 'complete') {
            ratingDetails = await fetchRatingDetails(booking.id, booking.type);
          }

          return {
            ...booking,
            startLocation,
            destLocation,
            ownerDetails,
            driverDetails,
            ratingDetails,
            status: booking.status || 'shared with cancelled original' 
          };
        } catch (error) {
          console.error('Error processing booking:', error);
          return null;
        }
      }));

      const validBookings = bookingsWithDetails.filter(booking => booking !== null);
      setBookings(validBookings);
      setFilteredBookings(validBookings);

      // Fetch cancelled reasons
      const cancelledBookings = validBookings.filter(booking => booking.status === 'canceled');
      const cancelledReasonsData = await Promise.all(
        cancelledBookings.map(async booking => {
          const reason = await fetchCancelledReason(booking.id, booking.type);
          return { [booking.id]: reason };
        })
      );
      setCancelledReasons(Object.assign({}, ...cancelledReasonsData));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [getLocationName, fetchCancelledReason, fetchDriverDetails, fetchOwnerDetails, fetchRatingDetails]);

  const handleChatClick = useCallback((ownerId) => {
    if (ownerId) {
      navigate('/customer/chat-with-owner', { state: { ownerId } });
    } else {
      message.error('Owner information not available');
    }
  }, [navigate]);

  const filterBookings = useCallback(() => {
    if (!dateRange[0] || !dateRange[1]) {
      setFilteredBookings(bookings);
      return;
    }

    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
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

  const getStatusTag = useCallback((status = 'unknown') => {
    const statusColors = {
      upcoming: 'blue',
      complete: 'green',
      canceled: 'red',
      unknown: 'default'
    };
    return (
      <Tag color={statusColors[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  }, []);

  const formatDateTime = useCallback((date, time) => {
    try {
      const dateObj = new Date(date);
      return `${dateObj.toLocaleDateString()} ${time || ''}`;
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Invalid date';
    }
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
        bookingType: 'original'
      });

      if (response.status === 200) {
        message.success('Rating submitted successfully');
        setRatingModalVisible(false);
        setCurrentRating(0);
        setReview('');
        setCurrentBookingId(null);
        setCurrentDriverId(null);

        setBookings(prevBookings => prevBookings.map(booking =>
          booking.id === currentBookingId ? { ...booking, rated: true } : booking
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
      await httpService.put(`/customer/cancelBooking/${currentBookingId}`, { reason: cancelReason });
      message.success('Booking cancelled successfully');
      setCancelModalVisible(false);
      setCancelReason('');
      fetchBookings(); // Refetch bookings to update the status
    } catch (error) {
      console.error('Error cancelling booking:', error);
      message.error('Failed to cancel booking');
    }
  }, [cancelReason, currentBookingId, fetchBookings]);

  const handleViewRideStatus = useCallback((bookingId) => {
    if (bookingId) {
      localStorage.setItem('bookingId', bookingId);
      navigate('/customer/pickup-stock', { state: { bookingId, bookingType: 'original' } });
    }
  }, [navigate]);

  const renderBookingCard = useCallback((booking) => {
    if (!booking) return null;

    return (
      <Card
        title={booking.vehicle?.type || 'Unknown Vehicle'}
        extra={getStatusTag(booking.status)}
        style={{ height: '100%' }}
        hoverable
      >
        {booking.vehicle?.photoUrl && (
          <img
            src={booking.vehicle.photoUrl}
            alt={booking.vehicle.type}
            style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '16px', borderRadius: '8px' }}
          />
        )}
        
        <p><CalendarOutlined style={{ marginRight: '8px' }} />{formatDateTime(booking.bookingDate, booking.pickupTime)}</p>
        <p><EnvironmentOutlined style={{ marginRight: '8px' }} />From: {booking.startLocation}</p>
        <p><EnvironmentOutlined style={{ marginRight: '8px' }} />To: {booking.destLocation}</p>
        <p><ClockCircleOutlined style={{ marginRight: '8px' }} />Travel Time: {booking.travellingTime?.toFixed(2) || 0} min</p>
        {booking.vehicle && (
          <p><CarOutlined style={{ marginRight: '8px' }} />Capacity: {booking.vehicle.capacity} {booking.vehicle.capacityUnit}</p>
        )}
        <p><DollarOutlined style={{ marginRight: '8px' }} />Charge: LKR {booking.vehicleCharge?.toFixed(2) || 0}</p>

        {booking.ownerDetails && (
          <p>
            <UserOutlined style={{ marginRight: '8px' }} />
            Owner: {`${booking.ownerDetails.firstName} ${booking.ownerDetails.lastName}`}
          </p>
        )}

        {booking.status === 'upcoming' && booking.driverDetails && (
          <p>
            <UserOutlined style={{ marginRight: '8px' }} />
            Driver: {`${booking.driverDetails.firstName} ${booking.driverDetails.lastName}`}
          </p>
        )}

        {booking.status === 'complete' && booking.ratingDetails && (
          <div>
            <p>Your Rating: <Rate disabled defaultValue={booking.ratingDetails.rate} /></p>
            {booking.ratingDetails.review && <p>Your Review: {booking.ratingDetails.review}</p>}
          </div>
        )}

        {booking.status === 'canceled' && (
          <p>
            <CloseCircleOutlined style={{ marginRight: '8px' }} />
            Cancellation Reason: {cancelledReasons[booking.id] || 'Loading...'}
          </p>
        )}

        <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
          {(booking.status === 'upcoming'|| booking.status === 'shared with cancelled original') && (
            <>
              <Button
                type="default"
                onClick={() => handleViewRideStatus(booking.id)}
                style={{ width: '100%' }}
                className="hover-button"
              >
                View Ride Status
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => handleCancelBooking(booking.id)}
                style={{ width: '100%' }}
                className="hover-button"
              >
                Cancel Booking
              </Button>
              {booking.ownerDetails && (
                <Button
                  type="default"
                  icon={<MessageOutlined />}
                  onClick={() => handleChatClick(booking.ownerDetails.id)}
                  style={{ width: '100%' }}
                  className="hover-button"
                >
                  Chat with Owner
                </Button>
              )}
            </>
          )}

          {booking.status === 'complete' && !booking.ratingDetails && (
            <Button
              type="default"
              onClick={() => handleRateBooking(booking.id, booking.driverDetails?.id)}
              style={{ width: '100%' }}
              className="hover-button"
            >
              Rate
            </Button>
          )}
        </Space>
      </Card>
    );
  }, [getStatusTag, formatDateTime, cancelledReasons, handleViewRideStatus, handleCancelBooking, handleRateBooking, handleChatClick]);

  const renderBookingList = useCallback((bookings) => (
    <Row gutter={[24, 24]}>
      {bookings.map((booking) => (
        <Col xs={24} sm={12} lg={8} key={booking.id}>
          {renderBookingCard(booking)}
        </Col>
      ))}
    </Row>), [renderBookingCard]);

if (loading) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>
  );
}

if (filteredBookings.length === 0) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Empty description="No bookings found" />
    </div>
  );
}

const today = new Date().setHours(0, 0, 0, 0);
const todayBookings = filteredBookings.filter(booking => 
  new Date(booking.bookingDate).setHours(0, 0, 0, 0) === today && booking.status === 'upcoming'
);
const upcomingBookings = filteredBookings.filter(booking => 
  new Date(booking.bookingDate) > new Date() && booking.status === 'upcoming'
);
const canceledBookings = filteredBookings.filter(booking => 
  booking.status === 'canceled' || booking.status === 'cancelled'
);
const pastBookings = filteredBookings.filter(booking => 
  new Date(booking.bookingDate) < new Date() && booking.status === 'complete'
);

return (
  <div style={{ padding: '24px' }}>
    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
      Booking History
    </h1>
    
    <Space direction="vertical" style={{ width: '100%', marginBottom: '24px' }}>
      <RangePicker
        onChange={handleDateRangeChange}
        style={{ width: '100%' }}
      />
    </Space>

    <Tabs defaultActiveKey="today">
      <TabPane tab="Today's Bookings" key="today">
        {todayBookings.length > 0 ? (
          renderBookingList(todayBookings)
        ) : (
          <Empty description="No bookings for today" />
        )}
      </TabPane>
      <TabPane tab="Upcoming Bookings" key="upcoming">
        {upcomingBookings.length > 0 ? (
          renderBookingList(upcomingBookings)
        ) : (
          <Empty description="No upcoming bookings" />
        )}
      </TabPane>
      <TabPane tab="Canceled Bookings" key="canceled">
        {canceledBookings.length > 0 ? (
          renderBookingList(canceledBookings)
        ) : (
          <Empty description="No canceled bookings" />
        )}
      </TabPane>
      <TabPane tab="Past Bookings" key="past">
        {pastBookings.length > 0 ? (
          renderBookingList(pastBookings)
        ) : (
          <Empty description="No past bookings" />
        )}
      </TabPane>
      <TabPane tab="All Bookings" key="all">
        {renderBookingList(filteredBookings)}
      </TabPane>
    </Tabs>

    {/* Rating Modal */}
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

    {/* Cancel Booking Modal */}
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
          <Radio key={reason} value={reason} style={{ marginBottom: '8px' }}>
            {reason}
          </Radio>
        ))}
      </Radio.Group>
    </Modal>
  </div>
);
};

export default BookingHistory;