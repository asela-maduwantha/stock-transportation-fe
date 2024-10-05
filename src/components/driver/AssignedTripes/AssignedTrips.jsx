import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  message,
  Typography,
  Space,
  Tag,
  Button,
  Row,
  Col,
  DatePicker,
  Modal,
  Tabs,
  Tooltip,
  Timeline,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  CarOutlined,
  TeamOutlined,
  SyncOutlined,
  CompassOutlined,
  EyeOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import httpService from "../../../services/httpService";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const GOOGLE_MAPS_API_KEY = "AIzaSyA4AnscOsaLsNUGrCnWrJH-k8XlBsltPgM";

const AssignedTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [sharedBookingDetails, setSharedBookingDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bookingDates, setBookingDates] = useState([]);

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
      return "Address not found";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const driverId = localStorage.getItem("driverId");
      const response = await httpService.get(`/driver/myBookings/${driverId}`);
      const tripsWithAddresses = await Promise.all(
        response.data.map(async (trip) => {
          const startAddress = await getAddressFromCoordinates(
            trip.startLat,
            trip.startLong
          );
          const destAddress = await getAddressFromCoordinates(
            trip.destLat,
            trip.destLong
          );
          return { ...trip, startAddress, destAddress, bookingDate: dayjs(trip.bookingDate) };
        })
      );
      setTrips(tripsWithAddresses);
      setBookingDates(tripsWithAddresses.map(trip => trip.bookingDate));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trips:", error);
      message.error("Failed to fetch trips. Please try again later.");
      setLoading(false);
    }
  }, []);

  const fetchSharedBookingDetails = async (bookingId) => {
    try {
      const response = await httpService.get(
        `/driver/sharedBookings/${bookingId}`
      );
      if (response.data && response.data.length > 0) {
        const sharedBooking = response.data[0];
        const startAddress = await getAddressFromCoordinates(
          sharedBooking.startLat,
          sharedBooking.startLong
        );
        const destAddress = await getAddressFromCoordinates(
          sharedBooking.destLat,
          sharedBooking.destLong
        );
        setSharedBookingDetails({
          ...sharedBooking,
          startAddress,
          destAddress,
        });
      } else {
        setSharedBookingDetails(null);
        message.info("No shared booking details available.");
      }
    } catch (error) {
      console.error("Error fetching shared booking details:", error);
      message.error("Failed to fetch shared booking details.");
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const filterTrips = (category) => {
    const today = dayjs().startOf('day');
    switch (category) {
      case 'today':
        return trips.filter(trip => trip.bookingDate.isSame(today, 'day'));
      case 'past':
        return trips.filter(trip => trip.bookingDate.isBefore(today, 'day'));
      case 'upcoming':
        return trips.filter(trip => trip.bookingDate.isAfter(today, 'day'));
      default:
        return trips.filter(trip => trip.bookingDate.isSame(selectedDate, 'day'));
    }
  };

  const handleViewSharedBooking = (trip) => {
    fetchSharedBookingDetails(trip.id);
    setIsModalVisible(true);
  };

  const handleNavigate = (trip) => {
    navigate("/driver/booking-navigations", {
      state: {
        originalBookingId: trip.id,
        bookingType: "original",
      },
    });
  };

  const formatTime = (time) => {
    return dayjs(time, "HH:mm:ss").format("HH:mm:ss");
  };

  const ButtonStyle = {
    backgroundColor: '#fdb940',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'normal',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '8px 16px',
    borderRadius: '4px',
  };

  const CardStyle = {
    width: "100%",
    marginBottom: "16px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  };

  const renderTripTimeline = (trips) => (
    <Timeline mode="left">
      {trips.map((item) => (
        <Timeline.Item key={item.id} label={formatTime(item.pickupTime)}>
          <Card hoverable style={CardStyle}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Text strong>
                    <EnvironmentOutlined style={{ color: "#1890ff" }} /> Start:
                  </Text>
                  <Text>{item.startAddress}</Text>
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Text strong>
                    <EnvironmentOutlined style={{ color: "#52c41a" }} /> Destination:
                  </Text>
                  <Text>{item.destAddress}</Text>
                </Space>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title="Pickup Time">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#faad14" }} />
                    <Text>{formatTime(item.pickupTime)}</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title="Travel Time">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#722ed1" }} />
                    <Text>{formatTime(dayjs().startOf('day').add(item.travellingTime, 'minute').format("HH:mm:ss"))}</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title="Loading Time">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#eb2f96" }} />
                    <Text>{formatTime(dayjs().startOf('day').add(item.loadingTime, 'minute').format("HH:mm:ss"))}</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title="Unloading Time">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#13c2c2" }} />
                    <Text>{formatTime(dayjs().startOf('day').add(item.unloadingTime, 'minute').format("HH:mm:ss"))}</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title="Load Capacity">
                  <Space>
                    <CarOutlined style={{ color: "#eb2f96" }} />
                    <Text>{item.loadingCapacity} kg</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title={item.isReturnTrip ? "Return Trip" : "One Way Trip"}>
                  <Tag color={item.isReturnTrip ? "green" : "blue"} style={{ padding: '4px 8px' }}>
                    <SyncOutlined spin={item.isReturnTrip} style={{ marginRight: 4 }} />
                    {item.isReturnTrip ? "Return" : "One Way"}
                  </Tag>
                </Tooltip>
              </Col>
              <Col xs={12} sm={6}>
                <Tooltip title={item.willingToShare ? "Willing to Share" : "Not Sharing"}>
                  <Tag color={item.willingToShare ? "green" : "red"} style={{ padding: '4px 8px' }}>
                    <TeamOutlined style={{ marginRight: 4 }} />
                    {item.willingToShare ? "Sharing" : "Not Sharing"}
                  </Tag>
                </Tooltip>
              </Col>
              <Col xs={24} sm={6}>
                <Space size="small" style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button
                    icon={<CompassOutlined />}
                    onClick={() => handleNavigate(item)}
                    style={ButtonStyle}
                  >
                    Navigate
                  </Button>
                  {item.willingToShare && (
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => handleViewSharedBooking(item)}
                      style={ButtonStyle}
                    >
                      View Shared
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
  );

  if (loading) {
    return (
      <Card style={{ width: "100%", textAlign: "center", margin: "20px 0" }}>
        <Spin size="large" />
      </Card>
    );
  }

  return (
    <Card
      title={<Title level={3}>Assigned Trips</Title>}
      style={{
        width: "100%",
        margin: "20px 0",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          style={{ width: "100%" }}
          disabledDate={(current) => {
            return !bookingDates.some(date => date.isSame(current, 'day'));
          }}
        />
        <Tabs defaultActiveKey="all" style={{ width: "100%" }}>
          <TabPane tab="All" key="all">
            {renderTripTimeline(filterTrips('all'))}
          </TabPane>
          <TabPane tab="Today" key="today">
            {renderTripTimeline(filterTrips('today'))}
          </TabPane>
          <TabPane tab="Past" key="past">
            {renderTripTimeline(filterTrips('past'))}
          </TabPane>
          <TabPane tab="Upcoming" key="upcoming">
            {renderTripTimeline(filterTrips('upcoming'))}
          </TabPane>
        </Tabs>
      </Space>
      <Modal
        title={<Title level={4}>Shared Booking Details</Title>}
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)} style={ButtonStyle}>
            Close
          </Button>,
        ]}
      >
        {sharedBookingDetails ? (
          <Card style={CardStyle}>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Text strong>
                    <EnvironmentOutlined style={{ color: "#1890ff" }} /> Start:
                  </Text>
                  <Text>{sharedBookingDetails.startAddress}</Text>
                </Space>
              </Col>
              <Col xs={24}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Text strong>
                    <EnvironmentOutlined style={{ color: "#52c41a" }} /> Destination:
                  </Text>
                  <Text>{sharedBookingDetails.destAddress}</Text>
                </Space>
              </Col>
              <Col xs={12}>
                <Tooltip title="Travel Time">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#722ed1" }} />
                    <Text>{formatTime(dayjs().startOf('day').add(sharedBookingDetails.travellingTime, 'minute').format("HH:mm:ss"))}</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12}>
                <Tooltip title="Average Handling Time">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#faad14" }} />
                    <Text>{formatTime(dayjs().startOf('day').add(sharedBookingDetails.avgHandlingTime, 'minute').format("HH:mm:ss"))}</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12}>
                <Tooltip title="Loading Time">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#eb2f96" }} />
                    <Text>{formatTime(dayjs().startOf('day').add(sharedBookingDetails.loadingTime, 'minute').format("HH:mm:ss"))}</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12}>
                <Tooltip title="Unloading Time">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#13c2c2" }} />
                    <Text>{formatTime(dayjs().startOf('day').add(sharedBookingDetails.unloadingTime, 'minute').format("HH:mm:ss"))}</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12}>
                <Tooltip title="Vehicle Charge">
                  <Space>
                    <DollarOutlined style={{ color: "#52c41a" }} />
                    <Text>${sharedBookingDetails.vehicleCharge.toFixed(2)}</Text>
                  </Space>
                </Tooltip>
              </Col>
              <Col xs={12}>
                <Tooltip title="Service Charge">
                  <Space>
                    <DollarOutlined style={{ color: "#1890ff" }} />
                    <Text>${sharedBookingDetails.serviceCharge.toFixed(2)}</Text>
                  </Space>
                </Tooltip>
              </Col>
            </Row>
          </Card>
        ) : (
          <Text>No shared booking details available.</Text>
        )}
      </Modal>
    </Card>
  );
};

export default AssignedTrips;