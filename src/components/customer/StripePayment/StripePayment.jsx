import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Spin, Button, List, message, Row, Col, Modal, Typography, Space, Divider, Statistic } from 'antd';
import { DollarOutlined, GiftOutlined, CreditCardOutlined, CheckCircleOutlined, DashboardOutlined, LockOutlined } from '@ant-design/icons';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import httpService from '../../../services/httpService';

const { Title, Text } = Typography;

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_51Pie4tRtQ613hbe8G3TikfPfnCtZPXAVVm3OoGLCVz9kakWSSsEavxrGfwOi5uruaWhQTLBA5LxJmWATyVeULFXU00vSXeQInt');

const PaymentForm = ({ amount, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      message.error(error.message);
      setLoading(false);
    } else {
      onPaymentSuccess(paymentMethod.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card
        title={<Space><LockOutlined /> Secure Payment</Space>}
        style={{ marginTop: 16 }}
      >
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading} 
          disabled={!stripe} 
          icon={<CreditCardOutlined />}
          style={{ marginTop: 16, width: '100%' }}
          size="large"
        >
          Pay LKR {amount.toFixed(2)}
        </Button>
      </Card>
    </form>
  );
};

PaymentForm.propTypes = {
  amount: PropTypes.number.isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
};

const StripePayment = () => {
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimedReward, setClaimedReward] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, bookingType, serviceCharge, balancePayment } = location.state || {};

  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId || !bookingType) {
        message.error('Booking information is missing');
        return;
      }
      try {
        setLoading(true);
        const customerId = localStorage.getItem('customerId');
        if (!customerId) {
          throw new Error('Customer ID not found');
        }
        const rewardsResponse = await httpService.get(`/customer/rewards/${customerId}`);
        setRewards(rewardsResponse.data.filter(reward => !reward.isClaimed));
        setPaymentSummary({ serviceCharge, balancePayment });
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to fetch necessary data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Prevent back navigation and refresh
    const preventNavigation = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', preventNavigation);
    return () => window.removeEventListener('beforeunload', preventNavigation);
  }, [bookingId, bookingType, serviceCharge, balancePayment]);

  const handleClaimReward = (reward) => {
    setClaimedReward(reward);
    const newBalancePayment = paymentSummary.balancePayment * (1 - reward.percentage / 100);
    setPaymentSummary(prev => ({ ...prev, balancePayment: newBalancePayment }));
  };

  const handlePaymentSuccess = async (stripeId) => {
    try {
      const response = await httpService.post(`/customer/balPaymant/${bookingId}`, {
        bookingType,
        stripeId,
        date: new Date().toISOString(),
        serviceCharge: paymentSummary.serviceCharge,
        balPayment: paymentSummary.balancePayment,
        rewardId: claimedReward ? claimedReward.id : ''
      });
      
      if (response.status === 200) {
        setShowSuccessModal(true);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      message.error('Failed to process payment. Please try again.');
    }
  };

  const handleNavigateToDashboard = () => {
    navigate('/customer/dashboard');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ padding: '24px' }}>
      <Col xs={24} lg={16}>
        <Card>
          <Title level={2}>Payment Summary</Title>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Service Charge"
                value={paymentSummary.serviceCharge}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="LKR"
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Balance Payment"
                value={paymentSummary.balancePayment}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="LKR"
              />
            </Col>
          </Row>
          {claimedReward && (
            <Row style={{ marginTop: 16 }}>
              <Col span={24}>
                <Statistic
                  title="Discount Applied"
                  value={claimedReward.percentage}
                  suffix="%"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
            </Row>
          )}
          <Divider />
          <Elements stripe={stripePromise}>
            <PaymentForm 
              amount={paymentSummary.balancePayment} 
              onPaymentSuccess={handlePaymentSuccess} 
            />
          </Elements>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title={<Space><GiftOutlined /> Available Rewards</Space>}>
          <List
            itemLayout="horizontal"
            dataSource={rewards}
            renderItem={reward => (
              <List.Item
                key={reward.id}
                actions={[
                  <Button 
                    key={`claim-btn-${reward.id}`}
                    onClick={() => handleClaimReward(reward)}
                    disabled={claimedReward}
                    type="primary"
                    ghost
                  >
                    Claim
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{`${reward.percentage}% Off`}</Text>}
                  description={`Valid until ${new Date(reward.date).toLocaleDateString()}`}
                />
              </List.Item>
            )}
            locale={{ emptyText: 'No rewards available' }}
          />
        </Card>
      </Col>

      <Modal
        visible={showSuccessModal}
        footer={null}
        closable={false}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
          <Title level={2} style={{ margin: '20px 0' }}>Payment Successful!</Title>
          <Text>Thank you for your payment.</Text><br></br>
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
    </Row>
  );
};

export default StripePayment;