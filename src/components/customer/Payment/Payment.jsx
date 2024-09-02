import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Row, Col, Form, Input, Button, Typography,  Card, Divider, Space, Modal } from 'antd';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const stripePromise = loadStripe('pk_test_51Pie4tRtQ613hbe8G3TikfPfnCtZPXAVVm3OoGLCVz9kakWSSsEavxrGfwOi5uruaWhQTLBA5LxJmWATyVeULFXU00vSXeQInt');

const CheckoutForm = ({ totalPrice, bookingId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isHovered, setIsHovered] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', description: '', success: false });
    const navigate = useNavigate();

    const payButtonStyles = {
        backgroundColor: '#fdb940',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 'normal',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, opacity 0.3s ease',
        opacity: isHovered ? '0.8' : '1',
    };

    const handleSubmit = async (values) => {
        if (!stripe || !elements) {
            return;
        }

        try {
            // Step 1: Create Payment Intent
            const paymentIntentResponse = await axios.post('https://stocktrans.azurewebsites.net/customer/paymentIntent', {
                amount: totalPrice,
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
                setModalContent({
                    title: 'Payment Failed',
                    description: paymentMethodError.message,
                    success: false,
                });
                setIsModalVisible(true);
                return;
            }

            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: paymentMethod.id,
            });
            
            if (confirmError) {
                setModalContent({
                    title: 'Payment Failed',
                    description: confirmError.message,
                    success: false,
                });
                setIsModalVisible(true);
                return;
            }
            
            if (paymentIntent.status === 'succeeded') {
                const paymentData = {
                    id: bookingId, 
                    stripeId: paymentIntent.id,
                    date: new Date().toISOString(), 
                    amount: paymentIntent.amount , 
                };
                console.log(paymentIntent)
                await axios.post(`https://stocktrans.azurewebsites.net/customer/payment/${bookingId}`, paymentData);
            
                setModalContent({
                    title: 'Thank You!',
                    description: 'Your payment was successful. Your booking is confirmed. Thank you for choosing us!',
                    success: true,
                });
                setIsModalVisible(true);
            } else {
                setModalContent({
                    title: 'Payment Not Completed',
                    description: 'Payment not completed.',
                    success: false,
                });
                setIsModalVisible(true);
            }
            
        } catch (error) {
            console.error('Payment processing failed:', error);
            setModalContent({
                title: 'Payment Error',
                description: 'An error occurred during payment processing.',
                success: false,
            });
            setIsModalVisible(true);
        }
    };

    return (
        <>
            <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                    hasFeedback
                >
                    <Input placeholder="Enter your email" />
                </Form.Item>
                <Form.Item
                    label="CardHolder's Name"
                    name="name"
                    rules={[{ required: true, message: `Please enter CardHolder's Name` }]}
                    hasFeedback
                >
                    <Input placeholder="CardHolder's Name" />
                </Form.Item>
                <Form.Item label="Card Details" name="cardDetails" style={{ marginBottom: '24px' }}>
                    <div style={{ border: '1px solid #424770', borderRadius: '4px', padding: '12px' }}>
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': { color: '#aab7c4' },
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
                        disabled={!stripe}
                        block
                        size="large"
                        style={payButtonStyles}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        Pay LKR {totalPrice.toFixed(2)}
                    </Button>
                </Form.Item>
            </Form>

            <Modal
                visible={isModalVisible}
                title={modalContent.title}
                onOk={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    modalContent.success ? (
                        <Button key="dashboard" type="primary" onClick={() => navigate('/dashboard')}>
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
};

const Payment = () => {
    const location = useLocation();
    const { bookingId, vehicle, pickupLocation, dropLocation, returnTrip, advanceAmount, totalPrice } = location.state;

    return (
        <Elements stripe={stripePromise}>
            <Row
                gutter={[24, 24]}
                justify="center"
                style={{ padding: '24px', backgroundColor: '#f0f2f5' }}
            >
                <Col xs={24}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
                        Secure Payment
                    </Title>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title={<Title level={4}>Booking Summary</Title>}
                        bordered={false}
                        style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
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
                            <Paragraph><Text strong>Pickup Location:</Text> {pickupLocation}</Paragraph>
                            <Paragraph><Text strong>Drop Location:</Text> {dropLocation}</Paragraph>
                            <Paragraph><Text strong>Return Trip:</Text> {returnTrip ? 'Yes' : 'No'}</Paragraph>
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
                <Col xs={24} lg={12}>
                    <Card
                        title={<Title level={4}>Payment Information</Title>}
                        bordered={false}
                        style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                    >
                        <CheckoutForm totalPrice={advanceAmount} bookingId={bookingId} />
                    </Card>
                </Col>
            </Row>
        </Elements>
    );
};

export default Payment;