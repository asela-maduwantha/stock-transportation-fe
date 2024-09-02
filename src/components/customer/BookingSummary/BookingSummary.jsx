import React from 'react';
import { Button, message, Row, Col, Card, Typography, Divider, Table, Space, Statistic } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { CarOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Title, Text } = Typography;

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
                        advanceAmount: charges.advancePayment,
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

    const data = [
        {
            key: "1",
            label: "Pickup Location",
            value: pickupLocation?.address,
        },
        {
            key: "2",
            label: "Dropoff Location",
            value: dropLocation?.address,
        },
        {
            key: "3",
            label: "Pickup Date & Time",
            value: `${pickupDate} at ${pickupTime}`,
        },
        {
            key: "4",
            label: "Calculated Drop Date & Time",
            value: `${calculatedDropDateTime?.date} at ${calculatedDropDateTime?.time}`,
        },
        {
            key: "5",
            label: "Total Distance",
            value: `${distance.toFixed(2)} km`,
        },
        {
            key: "6",
            label: "Return Trip",
            value: returnTrip ? "Yes" : "No",
        },
        {
            key: "7",
            label: "Loading Time",
            value: `${loadingTime} minutes`,
        },
        {
            key: "8",
            label: "Unloading Time",
            value: `${unloadingTime} minutes`,
        },
        {
            key: "9",
            label: "Willing to Share",
            value: shareSpace ? "Yes" : "No",
        },
    ];

    const columns = [
        {
            title: "",
            dataIndex: "label",
            key: "label",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "",
            dataIndex: "value",
            key: "value",
            render: (text) => <Text>{text}</Text>,
        },
    ];

    return (
        <div style={{ padding: "24px", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
            <Row gutter={[24, 24]} justify="center">
                <Col xs={24} lg={12}>
                    <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
                        Booking Summary
                    </Title>
                </Col>
            </Row>

            <Row gutter={[24, 24]} justify="center">
                <Col xs={24} lg={12}>
                    <Card hoverable style={{ marginBottom: "24px" }}>
                        <Title level={4} style={{ marginBottom: "16px" }}>
                            {selectedVehicle.name}
                        </Title>
                        <Space style={{ marginBottom: "16px" }}>
                            <CarOutlined />
                            <Text strong>Capacity:</Text>
                            <Text>{`${selectedVehicle.capacity}`}</Text>
                        </Space>
                        <Table
                            dataSource={data}
                            columns={columns}
                            pagination={false}
                            showHeader={false}
                            size="small"
                            bordered={false}
                        />
                        <Divider style={{ margin: "24px 0" }} />
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic
                                    title="Vehicle Charge"
                                    value={charges?.vehicleCharge.toFixed(2)}
                                    prefix="LKR"
                                    valueStyle={{ fontSize: "14px" }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Service Charge"
                                    value={charges?.serviceCharge.toFixed(2)}
                                    prefix="LKR"
                                    valueStyle={{ fontSize: "14px" }}
                                />
                            </Col>
                        </Row>
                        <Divider style={{ margin: "24px 0" }} />
                        <Row>
                            <Col span={24}>
                                <Statistic
                                    title="Total Price"
                                    value={charges?.total.toFixed(2)}
                                    prefix="LKR"
                                    valueStyle={{ color: "#3f8600", fontSize: "18px" }}
                                />
                            </Col>
                        </Row>
                        <Divider style={{ margin: "24px 0" }} />
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    onClick={handleBooking}
                                    style={{ height: "48px", fontSize: "16px", marginBottom: "16px" }}
                                >
                                    Proceed to Payment
                                </Button>
                                <Button
                                    block
                                    size="large"
                                    onClick={handleBack}
                                    style={{ height: "48px", fontSize: "16px" }}
                                >
                                    Cancel Booking
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default BookingSummary;
