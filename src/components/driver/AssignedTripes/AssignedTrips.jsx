import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Card,
  Badge,
  Modal,
  List,
  Spin,
  message,
  Typography,
  Space,
  Tag,
  Button,
  Row,
  Col,
  Select,
  Tooltip,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ReloadOutlined,
  TeamOutlined,
  SyncOutlined,
  CompassOutlined
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import httpService from "../../../services/httpService";

const { Text, Title } = Typography;
const { Option } = Select;

const GOOGLE_MAPS_API_KEY = "AIzaSyCYciRolf7wRjfQln989Tk4REwSeZl0zlE";

const AssignedTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [sharedBookingDetails, setSharedBookingDetails] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    fetchSharedBookingDetails(trip.id);
  };

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
          return { ...trip, startAddress, destAddress };
        })
      );
      setTrips(tripsWithAddresses);
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

  const getListData = (value) => {
    const dateString = value.format("YYYY-MM-DD");
    return trips.filter(
      (trip) => trip.bookingDate.split("T")[0] === dateString
    );
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul
        className="events"
        style={{ listStyle: "none", padding: 0, margin: 0 }}
      >
        {listData.slice(0, 3).map((item, index) => (
          <Tooltip
            key={item.id}
            title={`${item.startAddress} to ${item.destAddress}`}
            placement="topLeft"
          >
            <li style={{ marginBottom: "2px" }}>
              <Badge
                status={item.willingToShare ? "success" : "warning"}
                text={
                  <div style={{ fontSize: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <CarOutlined style={{ color: item.willingToShare ? "#52c41a" : "#faad14" }} />
                    <span>{` Trip ${index + 1}${item.isReturnTrip ? " (R)" : ""}`}</span>
                  </div>
                }
              />
            </li>
          </Tooltip>
        ))}
        {listData.length > 3 && (
          <li style={{ fontSize: "10px", color: "#1890ff" }}>
            +{listData.length - 3} more
          </li>
        )}
      </ul>
    );
  };

  const onSelect = (value) => {
    setSelectedDate(value);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setSelectedTrip(null);
    setSharedBookingDetails(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedTrip(null);
    setSharedBookingDetails(null);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleNavigate = () => {
    if (sharedBookingDetails) {
      navigate("/driver/shared-booking-navigations", {
        state: {
          startLat: sharedBookingDetails.startLat,
          startLong: sharedBookingDetails.startLong,
          destLat: sharedBookingDetails.destLat,
          destLong: sharedBookingDetails.destLong,
          orgStartLat: selectedTrip.startLat,
          orgStartLong: selectedTrip.startLong,
          orgDestLat: selectedTrip.destLat,
          orgDestLong: selectedTrip.destLong,
        },
      });
    } else if (selectedTrip) {
      navigate("/driver/shared-booking-navigations", {
        state: {
          startLat: selectedTrip.startLat,
          startLong: selectedTrip.startLong,
          destLat: selectedTrip.destLat,
          destLong: selectedTrip.destLong,
        },
      });
    }
  };

  if (loading) {
    return (
      <Card
        style={{
          width: "90%",
          maxWidth: "1200px",
          margin: "20px auto",
          textAlign: "center",
        }}
      >
        <Spin size="large" />
      </Card>
    );
  }

  return (
    <Card
      title={<Title level={3}>Assigned Trips</Title>}
      extra={
        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchTrips}>
          Refresh
        </Button>
      }
      style={{
        width: "90%",
        maxWidth: "1200px",
        margin: "20px auto",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "20px" }}>
        <Col xs={24} sm={8} md={6} lg={4}>
          <Select
            style={{ width: "100%" }}
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i} value={i}>
                {dayjs().month(i).format("MMMM")}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={6} lg={4}>
          <Select
            style={{ width: "100%" }}
            value={selectedYear}
            onChange={handleYearChange}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = dayjs().year() - 5 + i;
              return (
                <Option key={year} value={year}>
                  {year}
                </Option>
              );
            })}
          </Select>
        </Col>
      </Row>
      <Calendar
        dateCellRender={dateCellRender}
        onSelect={onSelect}
        value={dayjs().year(selectedYear).month(selectedMonth)}
        style={{
          width: "100%",
          margin: "0 auto",
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "#ffffff",
        }}
        headerRender={() => null}
      />
      <Modal
        title={
          <Title level={4}>{`Trips on ${selectedDate.format("MMMM D, YYYY")}`}</Title>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Close
          </Button>,
          <Button
            key="navigate"
            type="primary"
            icon={<CompassOutlined />}
            onClick={handleNavigate}
            disabled={!selectedTrip}
          >
            Navigate
          </Button>,
        ]}
        width="80%"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <List
              dataSource={getListData(selectedDate)}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    style={{ marginBottom: "16px", width: "100%" }}
                    onClick={() => handleTripSelect(item)}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24}>
                        <Space direction="vertical" size="small">
                          <Text strong>
                            <EnvironmentOutlined style={{ color: "#1890ff" }} /> Start:
                          </Text>
                          <Text>{item.startAddress}</Text>
                        </Space>
                      </Col>
                      <Col xs={24}>
                        <Space direction="vertical" size="small">
                          <Text strong>
                            <EnvironmentOutlined style={{ color: "#52c41a" }} /> Destination:
                          </Text>
                          <Text>{item.destAddress}</Text>
                        </Space>
                      </Col>
                      <Col xs={12}>
                        <Space>
                          <ClockCircleOutlined style={{ color: "#faad14" }} />
                          <Text strong>Pickup:</Text>
                          <Text>{item.pickupTime}</Text>
                        </Space>
                      </Col>
                      <Col xs={12}>
                        <Space>
                          <ClockCircleOutlined style={{ color: "#722ed1" }} />
                          <Text strong>Travel Time:</Text>
                          <Text>{item.travellingTime.toFixed(2)} min</Text>
                        </Space>
                      </Col>
                      <Col xs={12}>
                        <Space>
                          <CarOutlined style={{ color: "#eb2f96" }} />
                          <Text strong>Load:</Text>
                          <Text>{item.loadingCapacity} kg</Text>
                        </Space>
                      </Col>
                      <Col xs={12}>
                        <Space>
                          <SyncOutlined spin={item.isReturnTrip} style={{ color: "#13c2c2" }} />
                          <Tag color={item.isReturnTrip ? "green" : "blue"}>
                            {item.isReturnTrip ? "Return Trip" : "One Way"}
                          </Tag>
                          <TeamOutlined style={{ color: "#fa8c16" }} />
                          <Tag color={item.willingToShare ? "green" : "red"}>
                            {item.willingToShare ? "Willing to Share" : "Not Sharing"}
                          </Tag>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          </Col>
          <Col xs={24} md={12}>
            {selectedTrip && sharedBookingDetails ? (
              <Card>
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Space direction="vertical" size="small">
                      <Text strong>
                        <EnvironmentOutlined style={{ color: "#1890ff" }} /> Start:
                      </Text>
                      <Text>{sharedBookingDetails.startAddress}</Text>
                    </Space>
                  </Col>
                  <Col xs={24}>
                    <Space direction="vertical" size="small">
                      <Text strong>
                        <EnvironmentOutlined style={{ color: "#52c41a" }} /> Destination:
                      </Text>
                      <Text>{sharedBookingDetails.destAddress}</Text>
                    </Space>
                  </Col>
                  <Col xs={12}>
                    <Space>
                      <ClockCircleOutlined style={{ color: "#722ed1" }} />
                      <Text strong>Travel Time:</Text>
                      <Text>{(sharedBookingDetails.travellingTime / 60).toFixed(2)} hours</Text>
                    </Space>
                  </Col>
                  <Col xs={12}>
                    <Space>
                      <ClockCircleOutlined style={{ color: "#faad14" }} />
                      <Text strong>Avg. Handling Time:</Text>
                      <Text>{sharedBookingDetails.avgHandlingTime} minutes</Text>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ) : (
              <Text>No shared booking details available.</Text>
            )}
          </Col>
        </Row>
      </Modal>
    </Card>
  );
};

export default AssignedTrips;