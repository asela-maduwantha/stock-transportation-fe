import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Spin, Button, List, message, Row, Col } from 'antd';
import { DollarOutlined, GiftOutlined, CreditCardOutlined } from '@ant-design/icons';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import httpService from '../../../services/httpService';

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
      <CardElement />
      <Button 
        type="primary" 
        htmlType="submit" 
        loading={loading} 
        disabled={!stripe} 
        icon={<CreditCardOutlined />}
        style={{ marginTop: 16 }}
      >
        Pay LKR {amount.toFixed(2)}
      </Button>
    </form>
  );
};

// Define prop types for PaymentForm
PaymentForm.propTypes = {
  amount: PropTypes.number.isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
};

const StripePayment = () => {
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimedReward, setClaimedReward] = useState(null);
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

    //Prevent back navigation and refresh
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
      message.success('Payment successful!');
      navigate('/payment-confirmation', { state: { paymentId: response.data.id } });
    } catch (error) {
      console.error('Error processing payment:', error);
      message.error('Failed to process payment. Please try again.');
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Row gutter={[16, 16]} style={{ padding: '24px' }}>
      <Col xs={24} md={16}>
        <Card title="Payment Details" extra={<DollarOutlined />}>
          <p><strong>Service Charge:</strong> LKR {paymentSummary.serviceCharge.toFixed(2)}</p>
          <p><strong>Balance Payment:</strong> LKR {paymentSummary.balancePayment.toFixed(2)}</p>
          {claimedReward && (
            <p><strong>Discount Applied:</strong> {claimedReward.percentage}%</p>
          )}
          <Elements stripe={stripePromise}>
            <PaymentForm 
              amount={paymentSummary.balancePayment} 
              onPaymentSuccess={handlePaymentSuccess} 
            />
          </Elements>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title="Available Rewards" extra={<GiftOutlined />}>
          <List
            itemLayout="horizontal"
            dataSource={rewards}
            renderItem={reward => (
              <List.Item
                key={reward.id} // Add key prop for each item
                actions={[
                  <Button 
                    key={`claim-btn-${reward.id}`} // Add key to Button element
                    onClick={() => handleClaimReward(reward)}
                    disabled={claimedReward}
                  >
                    Claim
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={`${reward.percentage}% Off`}
                  description={`Valid until ${new Date(reward.date).toLocaleDateString()}`}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StripePayment;
