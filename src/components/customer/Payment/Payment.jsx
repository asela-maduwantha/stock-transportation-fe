import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Row, Col, Form, Input, Button, Typography, message, Card } from 'antd';

const { Title, Paragraph } = Typography;

const stripePromise = loadStripe('pk_test_51OjbUfBbzgz8n85obaL5JQMnOfw0vX3p07cXLpXiHStUGaoGYHsLgxeN01oXwF6ka7m49z0AGDLJyeoAf1knQzn000wcVEBhuC');

const CheckoutForm = ({ totalPrice }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (values) => {
        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: values.name,
                email: values.email,
            },
        });

        if (error) {
            message.error(error.message);
        } else {
            console.log(paymentMethod);
            message.success('Payment successful!');
            // Handle post-payment logic such as storing transaction info
        }
    };

    return (
        <Form onFinish={handleSubmit} layout="vertical" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
                <Input placeholder="Enter your name" />
            </Form.Item>
            <Form.Item label="Card Details" name="cardDetails" style={{ marginBottom: '24px' }}>
                <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } } } }} />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" disabled={!stripe} block>
                    Pay LKR {totalPrice}
                </Button>
            </Form.Item>
        </Form>
    );
};

CheckoutForm.propTypes = {
    totalPrice: PropTypes.number.isRequired,
};

const Payment = () => {
    const location = useLocation();
    const { vehicle, pickupLocation, dropLocation, returnTrip, advanceAmount, totalPrice } = location.state;

    return (
        <Elements stripe={stripePromise}>
            <Row gutter={[16, 16]} justify="center" style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
                <Col xs={24} md={12} lg={10}>
                    <Card
                        title={<Title level={4}>Booking Summary</Title>}
                        bordered={false}
                        style={{ marginBottom: '24px', borderRadius: '8px' }}
                    >
                        <img src={vehicle.photo} alt="Vehicle" style={{ width: '100%', height: 'auto', marginBottom: '16px', borderRadius: '8px' }} />
                        <Paragraph><strong>Vehicle:</strong> {vehicle.name}</Paragraph>
                        <Paragraph><strong>Pickup Location:</strong> {pickupLocation}</Paragraph>
                        <Paragraph><strong>Drop Location:</strong> {dropLocation}</Paragraph>
                        <Paragraph><strong>Return Trip:</strong> {returnTrip ? 'Yes' : 'No'}</Paragraph>
                        <Paragraph><strong>Advance Amount:</strong> LKR {advanceAmount}</Paragraph>
                        <Paragraph><strong>Total Price:</strong> LKR {totalPrice}</Paragraph>
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={10}>
                    <Card
                        title={<Title level={4}>Payment Information</Title>}
                        bordered={false}
                        style={{ borderRadius: '8px' }}
                    >
                        <CheckoutForm totalPrice={totalPrice} />
                    </Card>
                </Col>
            </Row>
        </Elements>
    );
};

export default Payment;
