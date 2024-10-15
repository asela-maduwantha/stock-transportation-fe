import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Row, Col, Form, Input, Button, Typography, Card, Divider, Space, Modal, message } from 'antd';
import { LockOutlined, CreditCardOutlined, MailOutlined, UserOutlined, CarOutlined, EnvironmentOutlined, SwapOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Title, Text, Paragraph } = Typography;

const stripePromise = loadStripe('pk_test_51Pie4tRtQ613hbe8G3TikfPfnCtZPXAVVm3OoGLCVz9kakWSSsEavxrGfwOi5uruaWhQTLBA5LxJmWATyVeULFXU00vSXeQInt');

const CheckoutForm = ({ totalPrice, bookingId, type }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '', success: false });
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const paymentIntentResponse = await httpService.post('/customer/paymentIntent', {
        amount: totalPrice.toFixed(2),
      });

      const { clientSecret } = paymentIntentResponse.data;
      const cardElement = elements.getElement(CardElement);

      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: values.name,
          email: values.email,
        },
      });

      if (paymentMethodError) {
        message.error(paymentMethodError.message);
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        message.error(confirmError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const paymentData = {
          stripeId: paymentIntent.id,
          date: new Date().toISOString(),
          amount: paymentIntent.amount,
          type: type,
        };

      
        await httpService.post(`/customer/advancePayment/${bookingId}`, paymentData);

        setModalContent({
          title: 'Payment Successful',
          description: 'Your booking is confirmed. Thank you for choosing us!',
          success: true,
        });
        setIsModalVisible(true);
      } else {
        message.warning('Payment not completed. Please try again.');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      message.error('An error occurred during payment processing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="email"
          rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="name"
          rules={[{ required: true, message: "Please enter the cardholder's name" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Cardholder's Name" />
        </Form.Item>
        <Form.Item name="cardDetails" style={{ marginBottom: '24px' }}>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px', padding: '10px' }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: 'rgba(0, 0, 0, 0.65)',
                    '::placeholder': { color: 'rgba(0, 0, 0, 0.45)' },
                  },
                  invalid: {
                    color: '#ff4d4f',
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!stripe || loading}
            loading={loading}
            icon={<LockOutlined />}
            block
            size="large"
            style={{
              backgroundColor: '#FDB940',
              borderColor: '#1890ff',
              height: '48px',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Pay LKR {totalPrice.toFixed(2)}
          </Button>
        </Form.Item>
      </Form>

      <Modal
        visible={isModalVisible}
        title={<Title level={4}>{modalContent.title}</Title>}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          modalContent.success ? (
            <Button key="dashboard" type="primary" onClick={() => navigate('/customer/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              Close
            </Button>
          ),
        ]}
      >
        <p>{modalContent.description}</p>
      </Modal>
    </>
  );
};

CheckoutForm.propTypes = {
  totalPrice: PropTypes.number.isRequired,
  bookingId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const Payment = () => {
  const location = useLocation();
  const { bookingId, vehicle, pickupLocation, dropLocation, returnTrip, advanceAmount, totalPrice, type } = location.state;

  return (
    <Elements stripe={stripePromise}>
      <Row
        gutter={[24, 24]}
        justify="center"
        style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}
      >
        <Col xs={24} md={20} lg={16} xl={12}>
          <Card
            title={<Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>Secure Payment</Title>}
            bordered={false}
            style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  title={<Title level={4}><CarOutlined /> Booking Summary</Title>}
                  bordered={false}
                  style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                >
                  <img
                    src={vehicle.photoUrl}
                    alt="Vehicle"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '150px',
                      objectFit: 'cover',
                      marginBottom: '16px',
                      borderRadius: '8px',
                    }}
                  />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>{vehicle.name}</Title>
                    <Paragraph><EnvironmentOutlined /> <Text strong>Pickup:</Text> {pickupLocation}</Paragraph>
                    <Paragraph><EnvironmentOutlined /> <Text strong>Drop:</Text> {dropLocation}</Paragraph>
                    <Paragraph><SwapOutlined /> <Text strong>Return Trip:</Text> {returnTrip ? 'Yes' : 'No'}</Paragraph>
                    <Divider />
                    <Paragraph>
                      <Text strong>Advance Amount:</Text> LKR {advanceAmount.toFixed(2)}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Total Price:</Text> <Text type="danger" strong>LKR {totalPrice.toFixed(2)}</Text>
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  title={<Title level={4}><CreditCardOutlined /> Payment Information</Title>}
                  bordered={false}
                  style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                >
                  <CheckoutForm totalPrice={advanceAmount} bookingId={bookingId} type={type} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Elements>
  );
};

export default Payment;