import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Spin, Typography, Alert, List, Tag, Collapse, Modal, Input, Space, Descriptions } from 'antd';
import { UserOutlined, ClockCircleOutlined, CheckCircleOutlined, DownOutlined, CarOutlined, StarOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AdminBookingDetails = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailModalContent, setDetailModalContent] = useState(null);
  const [detailModalTitle, setDetailModalTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await httpService.get('/admin/bookings');
      setBookings(response.data);
      setFilteredBookings(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    const lowercasedValue = value.toLowerCase();
    const filtered = bookings.filter((booking) => 
      booking.id.toString().includes(lowercasedValue) ||
      booking.status.toLowerCase().includes(lowercasedValue)
    );
    setFilteredBookings(filtered);
  }, [bookings]);

  const fetchDetails = async (bookingId, bookingType, endpoint, title) => {
    try {
      setLoading(true);
      const response = await httpService.get(`${endpoint}/${bookingId}`, {
        params: { type: bookingType },
      });
      setDetailModalContent(response.data);
      setDetailModalTitle(title);
      setDetailModalVisible(true);
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
      setError(`Failed to fetch ${title}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status) => {
    const color = status === 'Completed' ? 'success' : status === 'Pending' ? 'warning' : 'error';
    const icon = status === 'Completed' ? <CheckCircleOutlined /> : status === 'Pending' ? <ClockCircleOutlined /> : <ExclamationCircleOutlined />;
    return (
      <Tag color={color} icon={icon}>
        {status}
      </Tag>
    );
  };

  const renderDetailButtons = (booking) => {
    const bookingType = booking.sharedBooking.length > 0 ? 'shared' : 'original';
    return (
      <Space wrap>
        <Button size="small" icon={<UserOutlined />} onClick={() => fetchDetails(booking.id, bookingType, '/common/owner', 'Owner Details')}>
          Owner
        </Button>
        <Button size="small" icon={<UserOutlined />} onClick={() => fetchDetails(booking.id, bookingType, '/common/customer', 'Customer Details')}>
          Customer
        </Button>
        <Button size="small" icon={<CarOutlined />} onClick={() => fetchDetails(booking.id, bookingType, '/common/vehicle', 'Vehicle Details')}>
          Vehicle
        </Button>
        {booking.status === 'Completed' && (
          <>
            <Button size="small" icon={<UserOutlined />} onClick={() => fetchDetails(booking.id, bookingType, '/common/completedDriver', 'Driver Details')}>
              Driver
            </Button>
            <Button size="small" icon={<StarOutlined />} onClick={() => fetchDetails(booking.id, bookingType, '/common/rates', 'Rates and Review')}>
              Review
            </Button>
          </>
        )}
        {booking.status === 'Pending' && (
          <Button size="small" icon={<UserOutlined />} onClick={() => fetchDetails(booking.id, bookingType, '/common/upcomingDriver', 'Upcoming Driver Details')}>
            Upcoming Driver
          </Button>
        )}
        {booking.status === 'Cancelled' && (
          <Button size="small" icon={<ExclamationCircleOutlined />} onClick={() => fetchDetails(booking.id, bookingType, '/common/cancelledReason', 'Cancellation Reason')}>
            Cancellation Reason
          </Button>
        )}
      </Space>
    );
  };

  const renderDetailValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'object') {
      return (
        <Collapse ghost>
          <Panel header="View Details" key="1">
            <Descriptions column={1} size="small">
              {Object.entries(value).map(([subKey, subValue]) => (
                <Descriptions.Item key={subKey} label={subKey.charAt(0).toUpperCase() + subKey.slice(1)}>
                  {renderDetailValue(subValue)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Panel>
        </Collapse>
      );
    }
    return value.toString();
  };

  const renderDetailModal = () => (
    <Modal
      title={detailModalTitle}
      visible={detailModalVisible}
      onCancel={() => setDetailModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setDetailModalVisible(false)}>
          Close
        </Button>
      ]}
      width={720}
    >
      {detailModalContent && (
        <Descriptions bordered column={1}>
          {Object.entries(detailModalContent).map(([key, value]) => (
            <Descriptions.Item 
              key={key} 
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
            >
              {renderDetailValue(value)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      )}
    </Modal>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: '16px' }} align="center">
        <Title level={2}>Booking Details</Title>
        <Input
          placeholder="Search by ID or status"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 200 }}
        />
      </Space>
      {filteredBookings.length === 0 ? (
        <Alert message="No bookings found." type="info" />
      ) : (
        <List
          dataSource={filteredBookings}
          renderItem={(booking) => (
            <List.Item>
              <Card 
                style={{ width: '100%' }}
                title={
                  <Space>
                    <Text strong>Booking ID: {booking.id}</Text>
                    {renderStatus(booking.status)}
                  </Space>
                }
                extra={<Text type="secondary">Type: {booking.sharedBooking.length > 0 ? 'Shared' : 'Original'}</Text>}
              >
                {renderDetailButtons(booking)}
                {booking.sharedBooking.length > 0 && (
                  <Collapse style={{ marginTop: '16px' }}>
                    <Panel 
                      header={`Shared Bookings (${booking.sharedBooking.length})`}
                      key="1"
                      extra={<DownOutlined />}
                    >
                      <List
                        dataSource={booking.sharedBooking}
                        renderItem={(shared) => (
                          <List.Item>
                            <Card 
                              style={{ width: '100%' }}
                              title={
                                <Space>
                                  <Text strong>Shared Booking ID: {shared.id}</Text>
                                  {renderStatus(shared.status)}
                                </Space>
                              }
                              extra={<Text>Travelling Time: {shared.travellingTime} mins</Text>}
                            >
                              {renderDetailButtons(shared)}
                            </Card>
                          </List.Item>
                        )}
                      />
                    </Panel>
                  </Collapse>
                )}
              </Card>
            </List.Item>
          )}
        />
      )}
      {renderDetailModal()}
    </div>
  );
};

export default AdminBookingDetails;