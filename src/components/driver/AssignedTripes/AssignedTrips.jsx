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
  Drawer,
  Statistic,
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
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import httpService from "../../../services/httpService";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const GOOGLE_MAPS_API_KEY = "AIzaSyCZai7VHlL_ERUPIvG3x-ztG6NJugx08Bo";

const AssignedTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [sharedBookingDetails, setSharedBookingDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [bookingDates, setBookingDates] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [statistics, setStatistics] = useState({
    totalTrips: 0,
    originalTrips: 0,
    sharedTrips: 0,
  });

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
          return {
            ...trip,
            startAddress,
            destAddress,
            bookingDate: dayjs(trip.bookingDate),
          };
        })
      );
      setTrips(tripsWithAddresses);
      setBookingDates(tripsWithAddresses.map((trip) => trip.bookingDate));
      
      // Calculate statistics
      const totalTrips = tripsWithAddresses.length;
      const sharedTrips = tripsWithAddresses.filter(trip => trip.willingToShare).length;
      const originalTrips = totalTrips - sharedTrips;
      
      setStatistics({
        totalTrips,
        originalTrips,
        sharedTrips,
      });
      
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
    const today = dayjs().startOf("day");
    switch (category) {
      case "today":
        return trips.filter((trip) => trip.bookingDate.isSame(today, "day"));
      case "past":
        return trips.filter((trip) => trip.bookingDate.isBefore(today, "day"));
      case "upcoming":
        return trips.filter((trip) => trip.bookingDate.isAfter(today, "day"));
      default:
        return trips.filter(
          (trip) =>
            trip.bookingDate.isSame(selectedDate, "day") ||
            trip.bookingDate.isAfter(selectedDate, "day") ||
            trip.bookingDate.isBefore(selectedDate, "day")
        );
    }
  };

  const handleViewSharedBooking = (trip) => {
    fetchSharedBookingDetails(trip.id);
    setIsModalVisible(true);
  };

  const handleNavigate = async (trip) => {
    let sharedBookingId = null;
    let bookingType = "original";

    if (trip.willingToShare) {
      try {
        const response = await httpService.get(`/driver/sharedBookings/${trip.id}`);
        if (response.data && response.data.length > 0) {
          sharedBookingId = response.data[0].id;
          localStorage.setItem('sharedBookingId',sharedBookingId)
          bookingType ;
        }
      } catch (error) {
        console.error("Error fetching shared booking details:", error);
      }
    }

    navigate("/driver/booking-navigations", {
      state: {
        originalBookingId: trip.id,
        sharedBookingId,
        bookingType,
      },
    });
  };

  const formatTime = (time) => {
    return dayjs(time, "HH:mm:ss").format("HH:mm:ss");
  };

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setIsDrawerVisible(true);
  };

  const renderTripItem = (item) => (
    <Col xs={24} sm={12} key={item.id}>
      <Card
        hoverable
        style={{ marginBottom: 16 }}
        actions={[
          <Button
            key="navigate"
            icon={<CompassOutlined />}
            onClick={() => handleNavigate(item)}
            type="primary"
          >
            Navigate
          </Button>,
          <Button
            key="details"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(item)}
            type="default"
          >
            Details
          </Button>,
          item.willingToShare && (
            <Button
              key="shared"
              icon={<TeamOutlined />}
              onClick={() => handleViewSharedBooking(item)}
              type="default"
            >
              Shared
            </Button>
          ),
        ]}
      >
        <Card.Meta
          title={
            <Space>
              <Text strong>{item.bookingDate.format("DD/MM/YYYY")}</Text>
              <Tag color={item.isReturnTrip ? "green" : "blue"}>
                {item.isReturnTrip ? "Return" : "One Way"}
              </Tag>
            </Space>
          }
          description={
            <Space direction="vertical">
              <Text>
                <EnvironmentOutlined style={{ color: "#1890ff" }} /> From:{" "}
                {item.startAddress}
              </Text>
              <Text>
                <EnvironmentOutlined style={{ color: "#52c41a" }} /> To:{" "}
                {item.destAddress}
              </Text>
            </Space>
          }
        />
      </Card>
    </Col>
  );

  const renderTripDetails = (trip) => (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Card title="Trip Details" bordered={false}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>
              <CalendarOutlined /> Date: {trip.bookingDate.format("DD/MM/YYYY")}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>
              <ClockCircleOutlined /> Pickup Time: {formatTime(trip.pickupTime)}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>
              <ClockCircleOutlined /> Travel Time:{" "}
              {formatTime(
                dayjs()
                  .startOf("day")
                  .add(trip.travellingTime, "minute")
                  .format("HH:mm:ss")
              )}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>
              <ClockCircleOutlined /> Loading Time:{" "}
              {formatTime(
                dayjs()
                  .startOf("day")
                  .add(trip.loadingTime, "minute")
                  .format("HH:mm:ss")
              )}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>
              <ClockCircleOutlined /> Unloading Time:{" "}
              {formatTime(
                dayjs()
                  .startOf("day")
                  .add(trip.unloadingTime, "minute")
                  .format("HH:mm:ss")
              )}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>
              <CarOutlined /> Load Capacity: {trip.loadingCapacity} kg
            </Text>
          </Col>
          <Col span={12}>
            <Tag color={trip.isReturnTrip ? "green" : "blue"}>
              <SyncOutlined spin={trip.isReturnTrip} />{" "}
              {trip.isReturnTrip ? "Return Trip" : "One Way Trip"}
            </Tag>
          </Col>
          <Col span={12}>
            <Tag color={trip.willingToShare ? "green" : "red"}>
              <TeamOutlined />{" "}
              {trip.willingToShare ? "Willing to Share" : "Not Sharing"}
            </Tag>
          </Col>
        </Row>
      </Card>
      <Card title="Locations" bordered={false}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Text strong>
            <EnvironmentOutlined style={{ color: "#1890ff" }} /> Start:
          </Text>
          <Text>{trip.startAddress}</Text>
          <Text strong>
            <EnvironmentOutlined style={{ color: "#52c41a" }} /> Destination:
          </Text>
          <Text>{trip.destAddress}</Text>
        </Space>
      </Card>
    </Space>
  );

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
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="Total Trips" value={statistics.totalTrips} />
            </Col>
            <Col span={8}>
              <Statistic title="Original Trips" value={statistics.originalTrips} />
            </Col>
            <Col span={8}>
              <Statistic title="Shared Trips" value={statistics.sharedTrips} />
            </Col>
          </Row>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            style={{ width: "100%" }}
            disabledDate={(current) => {
              return !bookingDates.some((date) => date.isSame(current, "day"));
            }}
          />
          <Tabs defaultActiveKey="all" style={{ width: "100%" }}>
            <TabPane tab="All" key="all">
              <Row gutter={[16, 16]}>{filterTrips("all").map(renderTripItem)}</Row>
            </TabPane>
            <TabPane tab="Today" key="today">
              <Row gutter={[16, 16]}>{filterTrips("today").map(renderTripItem)}</Row>
            </TabPane>
            <TabPane tab="Past" key="past">
              <Row gutter={[16, 16]}>{filterTrips("past").map(renderTripItem)}</Row>
            </TabPane>
            <TabPane tab="Upcoming" key="upcoming">
              <Row gutter={[16, 16]}>{filterTrips("upcoming").map(renderTripItem)}</Row>
            </TabPane>
          </Tabs>
        </Space>
      )}
      
      <Modal
        title={<Title level={4}>Shared Booking Details</Title>}
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)} type="primary">
            Close
          </Button>,
        ]}
      >
        {sharedBookingDetails ? (
          <Card>
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
                <Text strong>
                  <ClockCircleOutlined /> Travel Time:{" "}
                  {formatTime(
                    dayjs()
                      .startOf("day")
                      .add(sharedBookingDetails.travellingTime, "minute")
                      .format("HH:mm:ss")
                  )}
                </Text>
              </Col>
              <Col xs={12}>
                <Text strong>
                  <ClockCircleOutlined /> Avg. Handling Time:{" "}
                  {formatTime(
                    dayjs()
                      .startOf("day")
                      .add(sharedBookingDetails.avgHandlingTime, "minute")
                      .format("HH:mm:ss")
                  )}
                </Text>
              </Col>
              <Col xs={12}>
                <Text strong>
                  <DollarOutlined /> Vehicle Charge: $
                  {sharedBookingDetails.vehicleCharge.toFixed(2)}
                </Text>
              </Col>
              <Col xs={12}>
                <Text strong>
                  <DollarOutlined /> Service Charge: $
                  {sharedBookingDetails.serviceCharge.toFixed(2)}
                </Text>
              </Col>
            </Row>
          </Card>
        ) : (
          <Text>No shared booking details available.</Text>
        )}
      </Modal>
      <Drawer
        title="Trip Details"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        visible={isDrawerVisible}
        width={320}
      >
        {selectedTrip && renderTripDetails(selectedTrip)}
      </Drawer>
    </Card>
  );
};

export default AssignedTrips;
                    