import React, { useState } from "react";
import { Card, Typography, Button, Row, Col, Divider, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

const SharedBookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const bookingData = location.state?.bookingData;

  if (!bookingData) {
    return <div>No booking data available</div>;
  }

  const confirmBooking = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("https://stocktrans.azurewebsites.net/customer/sharedBooking", {
        bookingId: bookingData.bookingId,
        startLong: bookingData.startLong,
        startLat: bookingData.startLat,
        destLong: bookingData.destLong,
        destLat: bookingData.destLat,
        travellingTime: bookingData.travellingTime,
        avgHandlingTime: bookingData.avgHandlingTime,
        vehicleCharge: bookingData.vehicleCharge,
        serviceCharge: bookingData.serviceCharge,
        status: "upcoming",
        isCancelled: false
      });

      if (response.status === 200) {
        message.success("Booking confirmed successfully!");
        navigate("/customer/dashboard"); // Adjust this route as needed
      } else {
        throw new Error("Failed to confirm booking");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      message.error("Failed to confirm booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title={<Title level={2}>Shared Booking Summary</Title>} className="booking-summary-card">
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <Card title="Vehicle Details" type="inner">
            <Text strong>Type: </Text>
            <Text>{bookingData.selectedVehicle.type}</Text>
            <br />
            <Text strong>Capacity: </Text>
            <Text>{`${bookingData.capacity} ${bookingData.selectedVehicle.capacityUnit}`}</Text>
          </Card>
        </Col>
        <Col span={24} md={12}>
          <Card title="Booking Details" type="inner">
            <Text strong>Booking Date: </Text>
            <Text>{new Date(bookingData.bookingDate).toLocaleDateString()}</Text>
            <br />
            <Text strong>Pickup Time: </Text>
            <Text>{bookingData.pickupTime}</Text>
            <br />
            <Text strong>End Time: </Text>
            <Text>{bookingData.endTime}</Text>
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Route Information" type="inner">
            <Text strong>Pickup Location: </Text>
            <Text>{bookingData.pickupLocation}</Text>
            <br />
            <Text strong>Dropoff Location: </Text>
            <Text>{bookingData.dropoffLocation}</Text>
            <br />
            <Text strong>Distance: </Text>
            <Text>{`${bookingData.distance.toFixed(2)} km`}</Text>
            <br />
            <Text strong>Estimated Travel Time: </Text>
            <Text>{`${Math.round(bookingData.travellingTime)} minutes`}</Text>
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <Card title="Handling Times" type="inner">
            <Text strong>Loading Time: </Text>
            <Text>{`${bookingData.loadingTime} minutes`}</Text>
            <br />
            <Text strong>Unloading Time: </Text>
            <Text>{`${bookingData.unloadingTime} minutes`}</Text>
          </Card>
        </Col>
        <Col span={24} md={12}>
          <Card title="Charges" type="inner">
            <Text strong>Vehicle Charge: </Text>
            <Text>{`$${bookingData.vehicleCharge.toFixed(2)}`}</Text>
            <br />
            <Text strong>Service Charge: </Text>
            <Text>{`$${bookingData.serviceCharge.toFixed(2)}`}</Text>
            <br />
            <Text strong>Total Charge: </Text>
            <Text>{`$${(bookingData.vehicleCharge + bookingData.serviceCharge).toFixed(2)}`}</Text>
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Row justify="end">
        <Col>
          <Button type="primary" onClick={confirmBooking} loading={isLoading}>
            Confirm Booking
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default SharedBookingSummary;