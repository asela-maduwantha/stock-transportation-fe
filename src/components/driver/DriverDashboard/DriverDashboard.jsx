import React from 'react';
import { Card, Col, Row, Button } from 'antd';
import { DashboardOutlined, ContainerOutlined, CarOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Dashboard Overview',
      description: 'View overall driver activity and performance.',
      link: '/driver/dashboard',
    },
    {
      key: 'pickup-stock',
      icon: <ContainerOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Stock Pending Pickup',
      description: 'View and manage pending stock pickups.',
      link: '/driver/pickup-stock',
    },
    {
      key: 'assigned-trips',
      icon: <CarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Assigned Trips',
      description: 'View your assigned trips and schedule.',
      link: '/driver/assigned-trips',
    },
    {
      key: 'vehicles',
      icon: <CarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Vehicles',
      description: 'Manage and monitor assigned vehicles.',
      link: '/driver/vehicles',
    },
    {
      key: 'profile-settings',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Profile Settings',
      description: 'Update your profile and account information.',
      link: '/driver/profile-settings',
    },
    {
      key: 'help',
      icon: <InfoCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Help & Support',
      description: 'Get help and support for any issues.',
      link: '/driver/help',
    },
  ];

  const renderCards = () => {
    return dashboardItems.map((item) => (
      <Col span={8} key={item.key} style={{ marginBottom: '20px' }}>
        <Card hoverable>
          {item.icon}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <Button type="primary" onClick={() => navigate(item.link)}>
            Go to {item.title}
          </Button>
        </Card>
      </Col>
    ));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Driver Dashboard</h1>
      <Row gutter={[16, 16]}>
        {renderCards()}
      </Row>
    </div>
  );
};

export default DriverDashboard;
