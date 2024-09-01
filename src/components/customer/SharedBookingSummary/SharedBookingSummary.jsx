import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Divider,
  message,
  Space,
  Statistic,
  Table,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { CarOutlined } from "@ant-design/icons";

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
      const response = await axios.post(
        "https://stocktrans.azurewebsites.net/customer/sharedBooking",
        {
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
          isCancelled: false,
        }
      );

      if (response.status === 200) {
        message.success("Booking confirmed successfully!");
        navigate("/customer/dashboard");
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

  const data = [
    {
      key: "1",
      label: "Pickup Location",
      value: bookingData.pickupLocation,
    },
    {
      key: "2",
      label: "Dropoff Location",
      value: bookingData.dropoffLocation,
    },
    {
      key: "3",
      label: "Distance",
      value: `${bookingData.distance.toFixed(2)} km`,
    },
    {
      key: "4",
      label: "Estimated Travel Time",
      value: `${Math.round(bookingData.travellingTime)} minutes`,
    },
    {
      key: "5",
      label: "Booking Date",
      value: new Date(bookingData.bookingDate).toLocaleDateString(),
    },
    {
      key: "6",
      label: "Pickup Time",
      value: bookingData.pickupTime,
    },
    {
      key: "7",
      label: "End Time",
      value: bookingData.endTime,
    },
    {
      key: "8",
      label: "Loading Time",
      value: `${bookingData.loadingTime} minutes`,
    },
    {
      key: "9",
      label: "Unloading Time",
      value: `${bookingData.unloadingTime} minutes`,
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
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      {/* Title Section */}
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} lg={12}>
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            Shared Booking Summary
          </Title>
        </Col>
      </Row>

      {/* Booking Information Card */}
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} lg={12}>
          <Card hoverable style={{ marginBottom: "24px" }}>
            {/* Vehicle Information */}
            <Title level={4} style={{ marginBottom: "16px" }}>
              {bookingData.selectedVehicle.type}
            </Title>
            <Space style={{ marginBottom: "16px" }}>
              <CarOutlined />
              <Text strong>Capacity:</Text>
              <Text>
                {`${bookingData.capacity} ${bookingData.selectedVehicle.capacityUnit}`}
              </Text>
            </Space>

            {/* Booking Details Table */}
            <Table
              dataSource={data}
              columns={columns}
              pagination={false}
              showHeader={false}
              size="small"
              bordered={false}
              style={{ marginBottom: "24px" }}
            />

            {/* Charges Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              <Col span={12}>
                <Statistic
                  title="Vehicle Charge"
                  value={bookingData.vehicleCharge.toFixed(2)}
                  prefix="LKR"
                  valueStyle={{ fontSize: "14px" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Service Charge"
                  value={bookingData.serviceCharge.toFixed(2)}
                  prefix="LKR"
                  valueStyle={{ fontSize: "14px" }}
                />
              </Col>
            </Row>

            <Divider style={{ margin: "24px 0" }} />

            {/* Total Price Section */}
            <Row style={{ marginBottom: "24px" }}>
              <Col span={24}>
                <Statistic
                  title="Total Price"
                  value={(bookingData.vehicleCharge + bookingData.serviceCharge).toFixed(2)}
                  prefix="LKR"
                  valueStyle={{ color: "#3f8600", fontSize: "18px" }}
                />
              </Col>
            </Row>

            {/* Buttons Section */}
            <Row justify="end">
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  onClick={confirmBooking}
                  loading={isLoading}
                  style={{
                    height: "40px",
                    fontSize: "14px",
                  }}
                >
                  Confirm Booking
                </Button>
                <Button
                  size="small"
                  onClick={() => navigate("/customer/booking")}
                  style={{
                    height: "40px",
                    fontSize: "14px",
                  }}
                >
                  Cancel Booking
                </Button>
              </Space>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SharedBookingSummary;
