import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  Button,
  Modal,
  Spin,
  Typography,
  Space,
  Tag,
  Timeline,
  Tooltip,
  Tabs,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  CarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import httpService from "../../../services/httpService";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const containerStyle = {
  width: "100%",
  height: "400px",
};

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      const ownerId = localStorage.getItem("ownerId");
      const response = await httpService.get(`/owner/myBookings/${ownerId}`);
      setBookings(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const groupedBookings = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      const date = new Date(booking.bookingDate).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    }, {});
  }, [bookings]);

  const geocodeLatLng = useCallback((geocoder, lat, lng) => {
    return new Promise((resolve, reject) => {
      const latlng = { lat, lng };
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve("Unknown");
          }
        } else {
          reject("Geocoder failed due to: " + status);
        }
      });
    });
  }, []);

  const handleViewMore = useCallback(
    async (booking) => {
      const geocoder = new window.google.maps.Geocoder();

      try {
        const [startLocation, endLocation] = await Promise.all([
          geocodeLatLng(geocoder, booking.startLat, booking.startLong),
          geocodeLatLng(geocoder, booking.destLat, booking.destLong),
        ]);

        setSelectedBooking({
          ...booking,
          startLocation,
          endLocation,
        });
        setShowModal(true);
      } catch (error) {
        console.error("Error fetching location names:", error);
      }
    },
    [geocodeLatLng]
  );

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setSelectedBooking(null);
    setDirectionsResponse(null);
  }, []);

  const renderMap = useMemo(() => {
    if (!selectedBooking) return null;

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{
          lat: selectedBooking.startLat,
          lng: selectedBooking.startLong,
        }}
        zoom={10}
      >
        <Marker
          position={{
            lat: selectedBooking.startLat,
            lng: selectedBooking.startLong,
          }}
          icon={{
            url: "/path/to/start-icon.png",
            scaledSize: new window.google.maps.Size(50, 50),
          }}
          label="Start"
        />
        <Marker
          position={{
            lat: selectedBooking.destLat,
            lng: selectedBooking.destLong,
          }}
          icon={{
            url: "/path/to/end-icon.png",
            scaledSize: new window.google.maps.Size(50, 50),
          }}
          label="End"
        />

        <DirectionsService
          options={{
            origin: {
              lat: selectedBooking.startLat,
              lng: selectedBooking.startLong,
            },
            destination: {
              lat: selectedBooking.destLat,
              lng: selectedBooking.destLong,
            },
            travelMode: "DRIVING",
          }}
          callback={(response) => {
            if (response?.status === "OK" && !directionsResponse) {
              setDirectionsResponse(response);
            }
          }}
        />

        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}
      </GoogleMap>
    );
  }, [selectedBooking, directionsResponse]);

  const renderBookingCard = useCallback(
    (booking) => (
      <Card
        key={booking.id}  // Added key prop here
        className="booking-card"
        hoverable
        actions={[
          <Tooltip key="view-more" title="View Booking Details and Map">
            <Button
              onClick={() => handleViewMore(booking)}
              icon={<EnvironmentOutlined />}
            >
              View More
            </Button>
          </Tooltip>,
        ]}
      >
        <Card.Meta
          title={`${booking.customer?.firstName || ""} ${
            booking.customer?.lastName || ""
          }`}
          description={
            <Space direction="vertical">
              <Text>
                <ClockCircleOutlined /> Pickup: {booking.pickupTime}
              </Text>
              <Text>
                <CarOutlined /> Vehicle: {booking.vehicleId}
              </Text>
              <Text>
                <DollarOutlined /> Total: LKR{" "}
                {(
                  (booking.vehicleCharge || 0) + (booking.serviceCharge || 0)
                ).toLocaleString()}
              </Text>
              <Tag color={booking.status === "Completed" ? "green" : "blue"}>
                {booking.status}
              </Tag>
            </Space>
          }
        />
      </Card>
    ),
    [handleViewMore]
  );

  const renderBookingDetails = useMemo(() => {
    if (!selectedBooking) return null;

    return (
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Customer"
              value={`${selectedBooking.customer.firstName}  ${selectedBooking.customer.lastName}`}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={12}>
            <Statistic title="Status" value={selectedBooking.status} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Phone"
              value={selectedBooking.customer.mobileNum}
              prefix={<PhoneOutlined />}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Email"
              value={selectedBooking.customer.email}
              prefix={<MailOutlined />}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Pickup Time"
              value={selectedBooking.pickupTime}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Vehicle"
              value={selectedBooking.vehicleId}
              prefix={<CarOutlined />}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Vehicle Charge"
              value={`LKR ${selectedBooking.vehicleCharge.toLocaleString()}`}
              prefix={<DollarOutlined />}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Service Charge"
              value={`LKR ${selectedBooking.serviceCharge.toLocaleString()}`}
              prefix={<DollarOutlined />}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Statistic
              title="Total Charge"
              value={`LKR ${(
                selectedBooking.vehicleCharge + selectedBooking.serviceCharge
              ).toLocaleString()}`}
              prefix={<DollarOutlined />}
            />
          </Col>
        </Row>
        <Paragraph>
          <Text strong>Start Location:</Text> {selectedBooking.startLocation}
        </Paragraph>
        <Paragraph>
          <Text strong>End Location:</Text> {selectedBooking.endLocation}
        </Paragraph>
      </Space>
    );
  }, [selectedBooking]);

  if (loading) return <Spin tip="Loading bookings..." size="large" />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ margin: "20px" }}>
      <Title level={2}>Bookings Overview</Title>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Timeline View" key="1">
          <Timeline mode="alternate">
            {Object.entries(groupedBookings).map(([date, dateBookings]) => (
              <Timeline.Item key={date} label={date}>
                <Title level={4}>
                  {date} ({dateBookings.length} bookings)
                </Title>
                {dateBookings.map((booking) => (
                  <div key={booking.id}>{renderBookingCard(booking)}</div>
                ))}
              </Timeline.Item>
            ))}
          </Timeline>
        </TabPane>
        <TabPane tab="List View" key="2">
          {Object.entries(groupedBookings).map(([date, dateBookings]) => (
            <div key={date}>
              <Title level={4}>
                {date} ({dateBookings.length} bookings)
              </Title>
              {dateBookings.map((booking) => (
                <div key={booking.id}>{renderBookingCard(booking)}</div>
              ))}
            </div>
          ))}
        </TabPane>
      </Tabs>

      <Modal
        title="Booking Details"
        visible={showModal}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Booking Information" key="1">
            {renderBookingDetails}
          </TabPane>
          <TabPane tab="Map View" key="2">
            {renderMap}
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default BookingsList;