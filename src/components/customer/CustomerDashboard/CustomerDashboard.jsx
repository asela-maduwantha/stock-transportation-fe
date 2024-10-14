import React from 'react';
import { Card, Row, Col, Typography, theme } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  CarFilled,
  HistoryOutlined,
  ShareAltOutlined,
  GiftOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { useToken } = theme;

const navigationItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    link: "/customer/dashboard",
    description: "Overview of your account and quick access to important information."
  },
  {
    key: "book",
    icon: <CarOutlined />,
    label: "Book Vehicle",
    link: "/customer/booking",
    description: "Reserve a vehicle for your next trip or errand."
  },
  {
    key: "shared-booking",
    icon: <CarFilled />,
    label: "Make Shared Booking",
    link: "/customer/shared-booking",
    description: "Book a shared ride to save costs and reduce environmental impact."
  },
  {
    key: "booking-history",
    icon: <HistoryOutlined />,
    label: "Booking History",
    link: "/customer/booking-history",
    description: "View and manage your past bookings and reservations."
  },
  {
    key: "sharedbookinghistory",
    icon: <ShareAltOutlined />,
    label: "Shared Booking History",
    link: "/customer/shared-booking-history",
    description: "Access your history of shared rides and carpools."
  },
  {
    key: "rewardlist",
    icon: <GiftOutlined />,
    label: "Rewards",
    link: "/customer/reward-list",
    description: "Check your reward points and available perks."
  },
  {
    key: 'profile-update',
    icon: <UserSwitchOutlined />,
    label: 'Profile Update',
    link: '/customer/profile-update',
    description: "Update your personal information and preferences."
  }
];

const CustomerDashboard = () => {
  const { token } = useToken();

  const primaryColor = '#fdb940';
  const secondaryColor = '#4a90e2';
  const tertiaryColor = '#34c759';

  const customTheme = {
    ...token,
    colorPrimary: primaryColor,
    colorSecondary: secondaryColor,
    colorTertiary: tertiaryColor,
  };

  return (
    <div style={{ 
      padding: '2rem', 
      background: `linear-gradient(135deg, ${customTheme.colorPrimary}22, ${customTheme.colorSecondary}22)`,
      minHeight: '100vh'
    }}>
      <Title level={2} style={{ color: customTheme.colorPrimary }}>Welcome to Your Dashboard</Title>
      <Paragraph style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        Manage your bookings, track rewards, and update your profile all in one place.
      </Paragraph>
      <Row gutter={[24, 24]}>
        {navigationItems.map((item, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
            <Link to={item.link} style={{ textDecoration: 'none' }}>
              <Card 
                hoverable 
                style={{ 
                  height: '100%', 
                  borderRadius: '15px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  border: 'none',
                  background: index % 3 === 0 ? `linear-gradient(135deg, ${customTheme.colorPrimary}22, ${customTheme.colorPrimary}44)` :
                               index % 3 === 1 ? `linear-gradient(135deg, ${customTheme.colorSecondary}22, ${customTheme.colorSecondary}44)` :
                               `linear-gradient(135deg, ${customTheme.colorTertiary}22, ${customTheme.colorTertiary}44)`
                }}
                headStyle={{ borderBottom: 'none' }}
                bodyStyle={{ padding: '1.5rem' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {React.cloneElement(item.icon, { 
                    style: { 
                      fontSize: '3rem', 
                      marginBottom: '0.5rem',
                      color: index % 3 === 0 ? customTheme.colorPrimary :
                             index % 3 === 1 ? customTheme.colorSecondary :
                             customTheme.colorTertiary
                    } 
                  })}
                  <Title level={4} style={{ marginBottom: '0.5rem', color: token.colorTextHeading }}>{item.label}</Title>
                </div>
                <Paragraph style={{ 
                  fontSize: '0.9rem', 
                  color: token.colorTextSecondary, 
                  textAlign: 'center',
                  marginBottom: 0
                }}>
                  {item.description}
                </Paragraph>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CustomerDashboard;