import React, { useState, useEffect } from 'react';
import { Table, Card, Statistic, Row, Col, Typography, Spin, message } from 'antd';
import { UserOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Title } = Typography;

const VehicleOwnerDashboard = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const ownerId = localStorage.getItem('ownerId'); // Get ownerId from localStorage
        const response = await httpService.get(`/owner/driverBookings/${ownerId}`);
        setDrivers(response.data);
        setLoading(false);
      } catch (error) {
        message.error('Failed to fetch drivers');
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  if (loading) return <Spin size="large" />;

  const totalBookings = drivers.reduce((sum, driver) => sum + driver.bookingCount, 0);
  const topDriver = drivers.reduce((max, driver) => (max.bookingCount > driver.bookingCount ? max : driver), {});

  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Driver ID',
      dataIndex: 'driverId',
      key: 'driverId',
    },
    {
      title: 'Bookings',
      dataIndex: 'bookingCount',
      key: 'bookingCount',
      sorter: (a, b) => a.bookingCount - b.bookingCount,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Vehicle Owner Dashboard</Title>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Drivers"
              value={drivers.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={totalBookings}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            {topDriver.firstName ? (
              <>
                <Statistic
                  title="Top Driver"
                  value={`${topDriver.firstName} ${topDriver.lastName}`}
                  prefix={<TrophyOutlined />}
                />
                <div>Bookings: {topDriver.bookingCount}</div>
              </>
            ) : (
              <Statistic title="Top Driver" value="N/A" prefix={<TrophyOutlined />} />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="Driver List">
        <Table
          dataSource={drivers}
          columns={columns}
          rowKey="driverId"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default VehicleOwnerDashboard;
