import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Spin, Button, message, Typography, Space, Modal } from 'antd';
import { LoadingOutlined, ExclamationCircleOutlined, CreditCardOutlined, CheckCircleOutlined, DashboardOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Title, Text } = Typography;

const BalancePayment = () => {
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, bookingType } = location.state || {};

  useEffect(() => {
    const fetchPaymentSummary = async () => {
      if (!bookingId || !bookingType) {
        message.error('Booking information is missing');
        return;
      }
      try {
        setLoading(true);
        const response = await httpService.get(`/common/paymentSummery/${bookingId}?type=${bookingType}`);
        setPaymentSummary(response.data);
      } catch (error) {
        console.error('Error fetching payment summary:', error);
        message.error('Failed to fetch payment summary');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentSummary();

    // Prevent back navigation
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', preventBackNavigation);
    window.addEventListener('beforeunload', preventRefresh);

    return () => {
      window.removeEventListener('popstate', preventBackNavigation);
      window.removeEventListener('beforeunload', preventRefresh);
    };
  }, [bookingId, bookingType]);

  const preventBackNavigation = (event) => {
    window.history.pushState(null, document.title, window.location.href);
    event.preventDefault();
    message.warning('Back navigation is disabled on this page.');
  };

  const preventRefresh = (event) => {
    event.preventDefault();
    event.returnValue = '';
  };

  const handleProceedPayment = () => {
    if (paymentSummary) {
      // Simulating a successful payment
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 1000);
    }
  };

  const handleNavigateToDashboard = () => {
    navigate('/customer/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  if (!paymentSummary) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card>
          <Space direction="vertical" align="center">
            <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
            <Text strong>No payment summary available</Text>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 480, margin: '0 auto' }}>
      <Card
        title={<Title level={3}>Payment Summary</Title>}
        extra={<CreditCardOutlined style={{ fontSize: 24 }} />}
        hoverable
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Vehicle Charge:</Text>
            <Text>{`LKR ${paymentSummary.vehicleCharge.toFixed(2)}`}</Text>
          </div>
          <div>
            <Text strong>Service Charge:</Text>
            <Text>{`LKR ${paymentSummary.serviceCharge.toFixed(2)}`}</Text>
          </div>
          <div>
            <Text strong>Handling Charge:</Text>
            <Text>{`LKR ${paymentSummary.handlingCharge.toFixed(2)}`}</Text>
          </div>
          <div>
            <Text strong>Total:</Text>
            <Text>{`LKR ${paymentSummary.total.toFixed(2)}`}</Text>
          </div>
          {paymentSummary.sharedDiscount && (
            <div>
              <Text strong>Shared Discount:</Text>
              <Text>{paymentSummary.sharedDiscount}</Text>
            </div>
          )}
          <div>
            <Text strong>Advance Payment:</Text>
            <Text>{`LKR ${paymentSummary.advancePayment.toFixed(2)}`}</Text>
          </div>
          <div>
            <Text strong type="danger">Balance Payment:</Text>
            <Text type="danger">{`LKR ${paymentSummary.balPayment.toFixed(2)}`}</Text>
          </div>
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={handleProceedPayment}
            size="large"
            block
          >
            Proceed to Balance Payment
          </Button>
        </Space>
      </Card>

      <Modal
        visible={showSuccessModal}
        footer={null}
        closable={false}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
          <Title level={2} style={{ margin: '20px 0' }}>Payment Successful!</Title>
          <Text>Thank you for your payment.</Text>
          <Button
            type="primary"
            icon={<DashboardOutlined />}
            onClick={handleNavigateToDashboard}
            size="large"
            style={{ marginTop: 20 }}
          >
            Go to Dashboard
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BalancePayment;