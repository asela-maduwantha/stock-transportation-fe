import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Select, Row, Col, Pagination, Spin, Empty, message, Modal, Tag } from 'antd';
import { CloseCircleOutlined, CarOutlined, CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const { Option } = Select;
const { confirm } = Modal;

const SharedBookingsHistory = () => {
  const [sharedBookings, setSharedBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const pageSize = 6;
  const navigate = useNavigate(); // Initialize navigate for programmatic navigation

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    const fetchSharedBookings = async () => {
      setLoading(true);
      try {
        const response = await httpService.get(`/customer/customerSharedBooking/${customerId}`);
        const bookings = response.data;
        const addressPromises = bookings.flatMap(booking => [
          { id: booking.id, type: 'start', lat: booking.startLat, long: booking.startLong },
          { id: booking.id, type: 'dest', lat: booking.destLat, long: booking.destLong }
        ]);

        Promise.all(addressPromises.map(({ id, type, lat, long }) =>
          getAddressFromCoordinates(lat, long).then(address => ({ id, type, address }))
        )).then(addressResults => {
          setAddresses(addressResults.reduce((acc, { id, type, address }) => {
            acc[id] = acc[id] || {};
            acc[id][type] = address;
            return acc;
          }, {}));
        });

        setSharedBookings(bookings);
        setFilteredBookings(bookings);
      } catch (error) {
        console.error('Error fetching shared bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedBookings();
  }, []);

  const getAddressFromCoordinates = (lat, long) => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng: long } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject('Unable to fetch address');
        }
      });
    });
  };

  const applyFilters = () => {
    let result = sharedBookings;

    if (statusFilter !== 'all') {
      result = result.filter(booking => (booking.status === 'upcoming' ? 'upcoming' : 'completed') === statusFilter);
    }

    if (vehicleFilter !== 'all') {
      result = result.filter(booking => booking.vehicle.type === vehicleFilter);
    }

    setFilteredBookings(result);
    setCurrentPage(1);
  };

  const handleCancelBooking = (id) => {
    confirm({
      title: 'Are you sure you want to cancel this booking?',
      content: 'Please note that your advance payment will not be refunded.',
      icon: <CloseCircleOutlined />,
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        httpService.put(`/customer/cancelSharedBooking/${id}`)
          .then(() => {
            message.success('Booking cancelled successfully');
            setSharedBookings(sharedBookings.filter(booking => booking.id !== id));
          })
          .catch(() => message.error('Failed to cancel booking'));
      },
    });
  };

  const handlePayBalance = (id) => {
    navigate(`/payment/${id}`); // Use navigate for programmatic navigation
  };

  const paginatedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <Spin size="large" />;

  if (filteredBookings.length === 0) return <Empty description="No bookings found" />;

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Shared Booking History</h1>

      <Space wrap style={{ marginBottom: '24px', justifyContent: 'center', width: '100%' }}>
        <Select defaultValue="all" style={{ width: 120 }} onChange={(value) => setStatusFilter(value)}>
          <Option value="all">All Status</Option>
          <Option value="upcoming">Upcoming</Option>
          <Option value="completed">Completed</Option>
        </Select>
        <Select defaultValue="all" style={{ width: 120 }} onChange={(value) => setVehicleFilter(value)}>
          <Option value="all">All Vehicles</Option>
          <Option value="Freezer">Freezer</Option>
          <Option value="Lorry">Lorry</Option>
        </Select>
        <Button type="primary" onClick={applyFilters}>Apply Filters</Button>
      </Space>

      <Row gutter={[24, 24]}>
        {paginatedBookings.map((booking) => (
          <Col xs={24} sm={12} lg={8} key={booking.id}>
            <Card
              title={booking.vehicle.type}
              extra={booking.status === 'upcoming' ? <Tag color="blue">Upcoming</Tag> : <Tag color="green">Completed</Tag>}
              style={{ height: '100%' }}
              hoverable
            >
              <img
                src={booking.vehicle.photoUrl}
                alt={booking.vehicle.type}
                style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '16px', borderRadius: '8px' }}
              />
              <p><CalendarOutlined /> {new Date(booking.date).toLocaleDateString()}</p>
              <p><EnvironmentOutlined /> From: {addresses[booking.id]?.start || 'Loading...'}</p>
              <p><EnvironmentOutlined /> To: {addresses[booking.id]?.dest || 'Loading...'}</p>
              <p><ClockCircleOutlined /> Travel Time: {booking.travellingTime} min</p>
              <p><CarOutlined /> Capacity: {booking.vehicle.capacity} {booking.vehicle.capacityUnit}</p>
              <p><DollarOutlined /> Charge: LKR {booking.vehicleCharge.toFixed(2)}</p>

              {booking.status === 'upcoming' && (
                <div style={{ marginTop: '16px' }}>
                 
                  <Button
                    type="primary"
                    onClick={() => handlePayBalance(booking.id)}
                    style={{ width: '100%' }}
                  >
                    Pay Balance
                  </Button>
                  <Button
                    type="primary" danger ghost
                    onClick={() => handleCancelBooking(booking.id)}
                    style={{ width: '100%', marginTop: '8px' }}
                  >
                    Cancel Booking
                  </Button>
                </div>
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
    </div>
  );
};

export default SharedBookingsHistory;
