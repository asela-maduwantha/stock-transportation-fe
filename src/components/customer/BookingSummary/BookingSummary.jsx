import React from 'react';
import { Button, Modal, message, Row, Col, Card, Typography, Divider } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
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

            console.log(bookingData);
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
        navigate('/booking-details');
    };

    return (
        <Modal
            title={<Title level={3}>Booking Summary</Title>}
            visible={true}
            footer={null}
            onCancel={handleBack}
            width={800}
        >
            <Row gutter={[24, 24]}>
                <Col span={12}>
                    <Card
                        cover={
                            <img
                                alt={selectedVehicle.name}
                                src={selectedVehicle.photo}
                                style={{ height: 200, objectFit: 'cover' }}
                            />
                        }
                        style={{ marginBottom: 24 }}
                    >
                        <Title level={4}>{selectedVehicle.name}</Title>
                        <Paragraph>
                            <Text strong>Capacity:</Text> {selectedVehicle.capacity}
                        </Paragraph>
                    </Card>
                    <Card title="Trip Details">
                        <Paragraph>
                            <Text strong>Pickup Location:</Text> {pickupLocation?.address}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Drop Location:</Text> {dropLocation?.address}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Pickup Date:</Text> {pickupDate}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Pickup Time:</Text> {pickupTime}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Return Trip:</Text> {returnTrip ? 'Yes' : 'No'}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Distance:</Text> {distance.toFixed(2)} km
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Drop Date & Time:</Text> {calculatedDropDateTime?.date} {calculatedDropDateTime?.time}
                        </Paragraph>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Charges Breakdown">
                        <Paragraph>
                            <Text strong>Vehicle Charge:</Text> LKR {charges?.vehicleCharge.toFixed(2)}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Service Charge:</Text> LKR {charges?.serviceCharge.toFixed(2)}
                        </Paragraph>
                        <Divider />
                        <Paragraph>
                            <Text strong>Total Price:</Text> <Text type="danger" strong>LKR {charges?.total.toFixed(2)}</Text>
                        </Paragraph>
                    </Card>
                    <div style={{ marginTop: 24 }}>
                        <Button type="primary" block size="large" onClick={handleBooking}>
                            Confirm Booking
                        </Button>
                        <Button block size="large" onClick={handleBack} style={{ marginTop: 16 }}>
                            Back to Details
                        </Button>
                    </div>
                </Col>
            </Row>
        </Modal>
    );
};

export default BookingSummary;