import React, { useEffect, useState, useCallback } from "react";
import { Calendar, Badge, Modal, Spin, Typography, Space, Row, Col,  Card, Tag, Divider } from "antd";
import httpService from "../../../services/httpService";
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import moment from 'moment';

const { Title, Text } = Typography;

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
      console.log(response.data)
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

  const handleSelectEvent = useCallback(async (date) => {
    const selectedDateBookings = bookings.filter(booking => 
      moment(booking.bookingDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );

    if (selectedDateBookings.length > 0) {
      const booking = selectedDateBookings[0];
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
    }
  }, [bookings, geocodeLatLng]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setSelectedBooking(null);
    setDirectionsResponse(null);
  }, []);

  const renderMap = () => {
    if (!selectedBooking) return null;

    return (
      <Card title="Trip Map" style={{ marginTop: 16 }}>
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
      </Card>
    );
  };

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;
  
    const statusColor = selectedBooking.status === "Completed" ? "#52c41a" : "#1890ff";
    const totalCharge = selectedBooking.vehicleCharge + selectedBooking.serviceCharge;
  
    return (
      <Space direction="vertical" size="medium" style={{ width: "100%" }}>
     
        
        {/* Booking Information */}
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Booking ID:</Text> {selectedBooking.id}
          </Col>
          <Col span={12}>
            <Text strong>Booking Date:</Text> {moment(selectedBooking.bookingDate).format('MMMM D, YYYY')}
          </Col>
          <Col span={12}>
            <Text strong>Status:</Text> <Tag color={statusColor}>{selectedBooking.status}</Tag>
          </Col>
          <Col span={12}>
            <Text strong>Vehicle:</Text> {selectedBooking.vehicleId}
          </Col>
        </Row>
        <Divider />
  
        {/* Customer Information */}
        <Title level={4} style={{ marginBottom: 8 }}>Customer Information</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Customer Name:</Text> {`${selectedBooking.customer.firstName} ${selectedBooking.customer.lastName}`}
          </Col>
          <Col span={12}>
            <Text strong>Phone:</Text> {selectedBooking.customer.mobileNum}
          </Col>
          
        </Row>
        <Divider />
  
        {/* Trip Details */}
        <Title level={4} style={{ marginBottom: 8 }}>Trip Details</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Pickup Time:</Text> {selectedBooking.pickupTime}
          </Col>
          <Col span={24}>
            <Text strong>Start Location:</Text> {selectedBooking.startLocation}
          </Col>
          <Col span={24}>
            <Text strong>End Location:</Text> {selectedBooking.endLocation}
          </Col>
        </Row>
        <Divider />
  
        {/* Payment Summary */}
        <Title level={4} style={{ marginBottom: 8 }}>Payment Summary</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Vehicle Charge:</Text> {`LKR ${selectedBooking.vehicleCharge.toLocaleString()}`}
          </Col>
          <Col span={12}>
            <Text strong>Service Charge:</Text> {`LKR ${selectedBooking.serviceCharge.toLocaleString()}`}
          </Col>
          <Col span={24}>
            <Divider />
            <Text strong>Total Charge:</Text>{" "}
            <Text style={{ color: '#cf1322', fontSize: '16px' }}>
              LKR {totalCharge.toLocaleString()}
            </Text>
          </Col>
        </Row>
        <Divider />
  
        {/* Route Map */}
        <Title level={4} style={{ marginBottom: 8 }}>Route Map</Title>
        {renderMap()}
      </Space>
    );
  };
  
  
  const dateCellRender = (value) => {
    const listData = bookings.filter(booking => 
      moment(booking.bookingDate).format('YYYY-MM-DD') === value.format('YYYY-MM-DD')
    );

    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
        {listData.map((item) => (
          <li key={item.id}>
            <Badge 
              status={item.status === "Completed" ? "success" : "processing"} 
              text={`${item.customer.firstName} ${item.customer.lastName}`} 
            />
          </li>
        ))}
      </ul>
    );
  };

  if (loading) return <Spin tip="Loading bookings..." size="large" />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ margin: "20px" }}>
      <Title level={2}>Bookings Calendar</Title>
      <Card>
        <Calendar 
          dateCellRender={dateCellRender} 
          onSelect={handleSelectEvent}
        />
      </Card>

      <Modal
        title={<Title level={3}>Booking Details</Title>}
        visible={showModal}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        {renderBookingDetails()}
      </Modal>
    </div>
  );
};

export default BookingsList;