import React, { useState } from 'react';
import { Card, Row, Col, Typography, theme, Button, Modal, Input, message,  Space } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  TeamOutlined,
  SwapOutlined,
  HistoryOutlined,
  UsergroupAddOutlined,
  GiftOutlined,
  BellOutlined,
  UserOutlined,
  LockOutlined,
  MessageOutlined,
  SmileOutlined,
  SendOutlined,
  SyncOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import httpService from '../../../services/httpService';

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;
const { TextArea } = Input;

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
    icon: <TeamOutlined />,
    label: "Shared Booking",
    link: "/customer/shared-booking",
    description: "Book a shared ride to save costs and reduce environmental impact."
  },
  {
    key: "return-booking",
    icon: <SwapOutlined />,
    label: "Return Trips",
    link: "/customer/available-return-trips",
    description: "Book a return trip for your journey."
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
    icon: <UsergroupAddOutlined />,
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
    key: "pedingpayments",
    icon: <SyncOutlined />,
    label: "Pending Paymnets",
    link: "/customer/pending-balance-payments",
    description: "Complete your payments of past bookings."
  },
  {
    key: "past-payments",
    icon: <DollarCircleOutlined />,
    label: "Payment History",
    link: "/customer/payment-history",
    description: "View your past payments."
  },
  {
    key: "notification",
    icon: <BellOutlined />,
    label: "Notifications",
    link: "/customer/notification",
    description: "View your latest notifications and updates."
  },
  {
    key: 'profile-update',
    icon: <UserOutlined />,
    label: 'Profile Update',
    link: '/customer/profile-update',
    description: "Update your personal information and preferences."
  },
  {
    key: 'password-change',
    icon: <LockOutlined />,
    label: 'Password Change',
    link: '/customer/password-change',
    description: "Change your account password for security."
  }
];

const CustomerDashboard = () => {
  const { token } = useToken();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryColor = '#fdb940';
  const secondaryColor = '#4a90e2';
  const tertiaryColor = '#34c759';

  const customTheme = {
    ...token,
    colorPrimary: primaryColor,
    colorSecondary: secondaryColor,
    colorTertiary: tertiaryColor,
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFeedback('');
    
  };

  const handleSubmit = async () => {
    if (!feedback.trim() ) {
      message.warning('Please provide a feedback!');
      return;
    }

    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      message.error('Customer ID not found');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await httpService.post(`/customer/feedback/${customerId}`, { feedback });
      
      if (response.status === 200) {
        message.success('Feedback submitted successfully');
        handleCancel();
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      background: `linear-gradient(135deg, ${customTheme.colorPrimary}22, ${customTheme.colorSecondary}22)`,
      minHeight: '100vh',
      position: 'relative'
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

      {/* Feedback Button */}
      <Button
        type="primary"
        icon={<MessageOutlined />}
        onClick={showModal}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}
      />

      {/* Feedback Modal */}
      <Modal
        title={
          <Space align="center">
            <SmileOutlined style={{ fontSize: '24px', color: customTheme.colorPrimary }} />
            <Title level={4} style={{ margin: 0 }}>We&apos;d love your feedback!</Title>
          </Space>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>Tell us more about your experience:</Text>
            <TextArea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your feedback helps us improve..."
              style={{ marginTop: '8px' }}
            />
          </div>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={isSubmitting}
            block
          >
            Submit Feedback
          </Button>
        </Space>
      </Modal>
    </div>
  );
};

export default CustomerDashboard;