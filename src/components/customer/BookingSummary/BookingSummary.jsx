import React from 'react';
import { Button, message, Row, Col, Card, Typography, Divider, Timeline, Tag, Statistic } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { CarOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined, LoadingOutlined } from '@ant-design/icons';
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
        shareSpace,
        loadingTime,
        unloadingTime
    } = location.state || {};

    const handleBooking = async () => {
        try {
            const customerId = localStorage.getItem('customerId');
            const bookingData = {
                createdAt: new Date().toISOString(),
                bookingDate: pickupDate,
                pickupTime: pickupTime,
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
                avgHandlingTime: loadingTime + unloadingTime,
                status: 'upcoming',
                vehicleId: selectedVehicle.id,
                customerId: customerId,
                loadingTime: loadingTime,
                unloadingTime: unloadingTime
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
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Booking Summary</Title>
            <Row gutter={[24, 24]} justify="center">
                <Col xs={24} lg={12}>
                    <Card
                        hoverable
                        cover={
                            <img
                                alt={selectedVehicle.name}
                                src={selectedVehicle.photoUrl}
                                style={{ height: 200, objectFit: 'cover' }}
                            />
                        }
                        style={{ marginBottom: 24 }}
                    >
                        <Title level={4}>{selectedVehicle.name}</Title>
                        <Tag color="blue" icon={<CarOutlined />} style={{ fontSize: '14px', padding: '3px 8px' }}>
                            Capacity: {selectedVehicle.capacity}
                        </Tag>
                    </Card>
                    
                    <Card title={<Title level={4}><EnvironmentOutlined /> Trip Details</Title>} className="booking-summary-card">
                        <Timeline>
                            <Timeline.Item color="green" dot={<LoadingOutlined style={{ fontSize: '16px' }} />}>
                                <Text strong>Pickup:</Text> {pickupLocation?.address}
                                <br />
                                <Text type="secondary">{pickupDate} at {pickupTime}</Text>
                                <br />
                                <Text type="secondary">Loading Time: {loadingTime} minutes</Text>
                            </Timeline.Item>
                            <Timeline.Item color="red" dot={<LoadingOutlined style={{ fontSize: '16px' }} />}>
                                <Text strong>Drop-off:</Text> {dropLocation?.address}
                                <br />
                                <Text type="secondary">{calculatedDropDateTime?.date} at {calculatedDropDateTime?.time}</Text>
                                <br />
                                <Text type="secondary">Unloading Time: {unloadingTime} minutes</Text>
                            </Timeline.Item>
                        </Timeline>
                        <Divider dashed />
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic 
                                    title="Total Distance" 
                                    value={`${distance.toFixed(2)} km`}
                                    prefix={<ClockCircleOutlined />} 
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic 
                                    title="Return Trip" 
                                    value={returnTrip ? "Yes" : "No"}
                                    valueStyle={{ color: returnTrip ? '#3f8600' : '#cf1322' }}
                                />
                            </Col>
                        </Row>
                        <Paragraph style={{ marginTop: 16 }}>
                            <Text strong>Willing to Share:</Text> {shareSpace ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card 
                        title={<Title level={4}><DollarOutlined /> Charges Breakdown</Title>} 
                        className="booking-summary-card"
                        style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 24 }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic 
                                    title="Vehicle Charge" 
                                    value={charges?.vehicleCharge.toFixed(2)}
                                    prefix="LKR" 
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic 
                                    title="Service Charge" 
                                    value={charges?.serviceCharge.toFixed(2)}
                                    prefix="LKR" 
                                />
                            </Col>
                        </Row>
                        <Divider style={{ margin: '24px 0' }} />
                        <Row>
                            <Col span={24}>
                                <Statistic 
                                    title="Total Price" 
                                    value={charges?.total.toFixed(2)}
                                    prefix="LKR"
                                    valueStyle={{ color: '#3f8600', fontSize: '24px' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                    <div className="confirm-button">
                        <Button type="primary" block size="large" onClick={handleBooking} style={{ height: '48px', fontSize: '18px', marginBottom: '16px' }}>
                            Proceed to Payment
                        </Button>
                        <Button block size="large" onClick={handleBack} style={{ height: '48px', fontSize: '16px' }}>
                            Cancel Booking
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default BookingSummary;