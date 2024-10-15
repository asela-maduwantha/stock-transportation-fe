import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Typography, Spin, message, Rate } from 'antd';
import { UserOutlined, BookOutlined, TrophyOutlined, StarOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import httpService from '../../../services/httpService';

const { Title } = Typography;

const VehicleOwnerDashboard = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerRating, setOwnerRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownerId = localStorage.getItem('ownerId');
        const [driversResponse, ratesResponse] = await Promise.all([
          httpService.get(`/owner/driverBookings/${ownerId}`),
          httpService.get(`/owner/rates/${ownerId}`)
        ]);
        setDrivers(driversResponse.data);
        setOwnerRating(parseFloat(ratesResponse.data) || 0);
        setLoading(false);
      } catch (error) {
        message.error('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spin size="large" />;

  const totalBookings = drivers.reduce((sum, driver) => sum + driver.bookingCount, 0);
  const topDriver = drivers.reduce((max, driver) => (max.bookingCount > driver.bookingCount ? max : driver), {});

  const chartData = drivers.map(driver => ({
    name: `${driver.firstName} ${driver.lastName}`,
    bookings: driver.bookingCount
  }));

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Vehicle Owner Dashboard</Title>
     
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Drivers"
              value={drivers.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={totalBookings}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
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
        <Col span={6}>
          <Card>
            <Statistic
              title="Owner Rating"
              value={ownerRating.toFixed(1)}
              prefix={<StarOutlined />}
              suffix={
                <Rate 
                  disabled 
                  allowHalf 
                  value={ownerRating} 
                  style={{ fontSize: '14px', marginLeft: '8px' }} 
                />
              }
            />
          </Card>
        </Col>
      </Row>
      <Card title="Driver Bookings">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="bookings" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default VehicleOwnerDashboard;