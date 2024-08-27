import React from 'react';
import { Button, message, Row, Col, Card, Typography, Divider, Timeline, Tag } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { CarOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Title, Text, Paragraph } = Typography;

const BookingSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        pickupLocation,
        dropLocation,
        pickupDate,
        pickupTime,
        returnTrip,
        distance,
        charges,
        selectedVehicle,
        calculatedDropDateTime,
        shareSpace
    } = location.state || {};

    const handleBooking = async () => {
        try {
            const customerId = localStorage.getItem('customerId');
            const bookingData = {
                createdAt: new Date().toISOString(),
                bookingDate: pickupDate,
                pickupTime: pickupTime,
                handlingTime: distance * 60,
                startLong: pickupLocation.lng,
                startLat: pickupLocation.lat,
                destLong: dropLocation.lng,
                destLat: dropLocation.lat,
                travellingTime: distance * 60,
                vehicleCharge: charges.vehicleCharge,
                serviceCharge: charges.serviceCharge,
                loadingCapacity: selectedVehicle.capacity,
                isReturnTrip: returnTrip,
                willingToShare: shareSpace,
                status: 'upcoming',
                vehicleId: selectedVehicle.id,
                customerId: customerId
            };

            const response = await httpService.post('/customer/booking', bookingData);

            if (response.data.bookingId) {
                localStorage.setItem('bookingId', response.data.bookingId);
                message.success('Booking confirmed!');
                
                navigate('/payment', {
                    state: {
                        bookingId: localStorage.getItem('bookingId'),
                        vehicle: selectedVehicle,
                        pickupLocation: pickupLocation.address,
                        dropLocation: dropLocation.address,
                        returnTrip,
                        advanceAmount: charges.vehicleCharge,
                        totalPrice: charges.total
                    }
                });
            } else {
                message.error('Failed to confirm booking.');
            }
        } catch (error) {
            console.error('Error booking:', error);
            message.error('Error confirming booking.');
        }
    };

    const handleBack = () => {
        navigate('/customer/booking');
    };

    return (
        <div className="booking-summary-container">
            <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>Booking Summary</Title>
            <Row gutter={[16, 16]} justify="center">
                <Col xs={24} md={12}>
                    <Card
                        hoverable
                        cover={
                            <img
                                alt={selectedVehicle.name}
                                src={selectedVehicle.photoUrl}
                                style={{ height: 150, objectFit: 'cover' }}
                            />
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <Title level={4}>{selectedVehicle.name}</Title>
                        <Tag color="blue" icon={<CarOutlined />} style={{ fontSize: '14px', padding: '3px 8px' }}>
                            Capacity: {selectedVehicle.capacity}
                        </Tag>
                    </Card>
                    
                    <Card title={<Title level={5}><EnvironmentOutlined /> Trip Details</Title>} className="booking-summary-card">
                        <Timeline>
                            <Timeline.Item color="green">
                                <Text strong>Pickup:</Text> {pickupLocation?.address}
                                <br />
                                <Text type="secondary">{pickupDate} at {pickupTime}</Text>
                            </Timeline.Item>
                            <Timeline.Item color="red">
                                <Text strong>Drop-off:</Text> {dropLocation?.address}
                                <br />
                                <Text type="secondary">{calculatedDropDateTime?.date} at {calculatedDropDateTime?.time}</Text>
                            </Timeline.Item>
                        </Timeline>
                        <Divider dashed />
                        <Paragraph>
                            <ClockCircleOutlined /> <Text strong>Total Distance:</Text> {distance.toFixed(2)} km
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Return Trip:</Text> {returnTrip ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Willing to Share:</Text> {shareSpace ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card 
                        title={<Title level={5}><DollarOutlined /> Charges Breakdown</Title>} 
                        className="booking-summary-card"
                        style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
                    >
                        <Row align="middle" justify="space-between" style={{ marginBottom: 8 }}>
                            <Col><Text>Vehicle Charge:</Text></Col>
                            <Col><Text strong>LKR {charges?.vehicleCharge.toFixed(2)}</Text></Col>
                        </Row>
                        <Row align="middle" justify="space-between" style={{ marginBottom: 8 }}>
                            <Col><Text>Service Charge:</Text></Col>
                            <Col><Text strong>LKR {charges?.serviceCharge.toFixed(2)}</Text></Col>
                        </Row>
                        <Divider style={{ margin: '8px 0' }} />
                        <Row align="middle" justify="space-between">
                            <Col><Text strong style={{ fontSize: '16px' }}>Total Price:</Text></Col>
                            <Col><Text type="danger" strong style={{ fontSize: '20px' }}>LKR {charges?.total.toFixed(2)}</Text></Col>
                        </Row>
                    </Card>
                    <div className="confirm-button">
                        <Button type="primary" block size="middle" onClick={handleBooking} style={{ height: '40px', fontSize: '16px', marginTop: '16px' }}>
                            Proceed to Payment
                        </Button>
                        <Button block size="middle" onClick={handleBack} style={{ marginTop: 12, height: '40px', fontSize: '14px' }}>
                            Cancel Booking
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default BookingSummary;
