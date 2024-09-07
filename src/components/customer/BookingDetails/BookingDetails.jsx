import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Card,
  Input,
  Button,
  Checkbox,
  DatePicker,
  TimePicker,
  Select,
  message,
  Row,
  Col,
  Typography,
  Popover,
  Form,
  Space,
} from "antd";
import {
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import {
  EnvironmentOutlined,
  ShareAltOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import httpService from "../../../services/httpService";
import "./BookingDetails.css";

const { Option } = Select;
const { Title, Text } = Typography;

const BookingDetails = ({ selectedVehicle }) => {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [returnTrip, setReturnTrip] = useState(false);
  const [distance, setDistance] = useState(0);
  const [formattedDistance, setFormattedDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
  const [directions, setDirections] = useState(null);
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropAutocomplete, setDropAutocomplete] = useState(null);
  const [pickupDate, setPickupDate] = useState(null);
  const [pickupTime, setPickupTime] = useState(null);
  const [calculatedDropDateTime, setCalculatedDropDateTime] = useState(null);
  const [capacity, setCapacity] = useState(1);
  const [shareSpace, setShareSpace] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [charges, setCharges] = useState(null);
  const [loadingTime, setLoadingTime] = useState(15);
  const [unloadingTime, setUnloadingTime] = useState(15);
  const [isHovered, setIsHovered] = useState(false);

  const navigate = useNavigate();

  const onPickupLoad = (autocomplete) => {
    setPickupAutocomplete(autocomplete);
  };

  const onDropLoad = (autocomplete) => {
    setDropAutocomplete(autocomplete);
  };

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete) {
      const place = pickupAutocomplete.getPlace();
      setPickupLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
      });
      setPickupAddress(place.formatted_address);
    }
  };

  const onDropPlaceChanged = () => {
    if (dropAutocomplete) {
      const place = dropAutocomplete.getPlace();
      setDropLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
      });
      setDropAddress(place.formatted_address);
    }
  };

  const fetchCharges = useCallback(async () => {
    try {
      const response = await httpService.post(`/customer/calCharge`, {
        vehicleId: selectedVehicle.id,
        distance: distance,
        returnTrip: returnTrip,
      });
      setCharges(response.data);
    } catch (error) {
      message.error("Failed to fetch charges.");
    }
  }, [distance, selectedVehicle.id, returnTrip]);

  const formatTravelTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (pickupLocation && dropLocation && pickupDate && pickupTime) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(
            pickupLocation.lat,
            pickupLocation.lng
          ),
          destination: new window.google.maps.LatLng(
            dropLocation.lat,
            dropLocation.lng
          ),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const routeDistance =
              result.routes[0].legs[0].distance.value / 1000;
            setDistance(routeDistance);
            setFormattedDistance(result.routes[0].legs[0].distance.text);

            const travelDurationInSeconds =
              result.routes[0].legs[0].duration.value;
            setTravelTime(formatTravelTime(travelDurationInSeconds));

            const pickupDateTime = moment(`${pickupDate} ${pickupTime}`);
            const dropDateTime = pickupDateTime
              .clone()
              .add(travelDurationInSeconds, "seconds");
            setCalculatedDropDateTime({
              date: dropDateTime.format("YYYY-MM-DD"),
              time: dropDateTime.format("HH:mm"),
            });
            fetchCharges();
          }
        }
      );
    }
  }, [pickupLocation, dropLocation, pickupDate, pickupTime, fetchCharges]);

  const proceedButtonStyle = {
    backgroundColor: isHovered ? "#fdb940" : "#fdb940",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "normal",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease, opacity 0.3s ease",
    opacity: isHovered ? "0.8" : "1",
  };

  return (
    <div className="booking-details-form">
      <Title level={2}>Booking Details</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            cover={
              <img
                alt={selectedVehicle.type}
                src={selectedVehicle.photoUrl}
                style={{ objectFit: "cover", height: "300px" }}
              />
            }
          >
            <Card.Meta
              title={<Title level={3}>{selectedVehicle.type}</Title>}
              description={
                <Space direction="vertical" size="small">
                  <Text>
                    <strong>Type:</strong> {selectedVehicle.type}
                  </Text>
                  <Text>
                    <strong>Preferred Area:</strong>{" "}
                    {selectedVehicle.preferredArea}
                  </Text>
                  <Text>
                    <strong>Capacity:</strong> {selectedVehicle.capacity}{" "}
                    {selectedVehicle.capacityUnit}
                  </Text>
                  <Text>
                    <strong>Charge Per Km:</strong> LKR{" "}
                    {selectedVehicle.chargePerKm.toFixed(2)}
                  </Text>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<Title level={4}>Trip Information</Title>}
            className="booking-details-card"
          >
            <Form layout="vertical">
              <Form.Item label={<Text strong>Pickup Location</Text>}>
                <Autocomplete
                  onLoad={onPickupLoad}
                  onPlaceChanged={onPickupPlaceChanged}
                >
                  <Input
                    prefix={<EnvironmentOutlined />}
                    placeholder="Enter pickup location"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                  />
                </Autocomplete>
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={<Text strong>Pickup Date</Text>}>
                    <DatePicker
                      style={{ width: "100%" }}
                      onChange={(date, dateString) => setPickupDate(dateString)}
                      disabledDate={(current) =>
                        current && current < moment().startOf("day")
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={<Text strong>Pickup Time</Text>}>
                    <TimePicker
                      style={{ width: "100%" }}
                      onChange={(time, timeString) => setPickupTime(timeString)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label={<Text strong>Drop-off Location</Text>}>
                <Autocomplete
                  onLoad={onDropLoad}
                  onPlaceChanged={onDropPlaceChanged}
                >
                  <Input
                    prefix={<EnvironmentOutlined />}
                    placeholder="Enter drop-off location"
                    value={dropAddress}
                    onChange={(e) => setDropAddress(e.target.value)}
                  />
                </Autocomplete>
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={<Text strong>Loading Time</Text>}>
                    <Select
                      value={loadingTime}
                      onChange={(value) => setLoadingTime(value)}
                    >
                      <Option value={15}>15 mins</Option>
                      <Option value={30}>30 mins</Option>
                      <Option value={60}>1 hour</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={<Text strong>Unloading Time</Text>}>
                    <Select
                      value={unloadingTime}
                      onChange={(value) => setUnloadingTime(value)}
                    >
                      <Option value={15}>15 mins</Option>
                      <Option value={30}>30 mins</Option>
                      <Option value={60}>1 hour</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label={<Text strong>Capacity Utilization</Text>}>
                <Select
                  style={{ width: "100%" }}
                  value={capacity}
                  onChange={(value) => {
                    setCapacity(value);
                    setShareSpace(value < 1);
                  }}
                >
                  <Option value={0.3}>1/3 of vehicle capacity</Option>
                  <Option value={0.5}>1/2 of vehicle capacity</Option>
                  <Option value={1}>Full vehicle capacity</Option>
                </Select>
              </Form.Item>
              {capacity < 1 && (
                <Form.Item>
                  <Checkbox
                    checked={shareSpace}
                    onChange={(e) => setShareSpace(e.target.checked)}
                    disabled={returnTrip} 
                  >
                    <Space>
                      <ShareAltOutlined />
                      <Text>Willing to Share</Text>
                      <Popover
                        content="Sharing space with another customer allows you to split the cost but might increase the travel time."
                        title="Willing to Share"
                        trigger="click"
                      >
                        <a href="#">More Info</a>
                      </Popover>
                    </Space>
                  </Checkbox>
                </Form.Item>
              )}
              <Form.Item>
                <Checkbox
                  checked={returnTrip}
                  onChange={(e) => {
                    setReturnTrip(e.target.checked);
                    if (e.target.checked) {
                      setShareSpace(false); // Reset shareSpace to false when returnTrip is checked
                    }
                  }}
                >
                  <Space>
                    <SwapOutlined />
                    <Text>Return Trip</Text>
                    <Popover
                      content="A return trip allows you to book the vehicle for a round trip, potentially saving on overall costs."
                      title="Return Trip"
                      trigger="click"
                    >
                      <a href="#">More Info</a>
                    </Popover>
                  </Space>
                </Checkbox>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div style={{ height: "400px", width: "100%", marginBottom: "16px" }}>
            <GoogleMap
              mapContainerStyle={{ height: "100%", width: "100%" }}
              center={
                pickupLocation && dropLocation
                  ? {
                      lat: (pickupLocation.lat + dropLocation.lat) / 2,
                      lng: (pickupLocation.lng + dropLocation.lng) / 2,
                    }
                  : { lat: 6.9271, lng: 79.8612 }
              }
              zoom={10}
            >
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Button
            type="primary"
            block
            className="submit-button"
            style={proceedButtonStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() =>
              navigate("/customer/booking-summary", {
                state: {
                  pickupLocation,
                  dropLocation,
                  pickupDate,
                  pickupTime,
                  returnTrip,
                  distance,
                  formattedDistance,
                  travelTime,
                  selectedVehicle,
                  calculatedDropDateTime,
                  capacity,
                  shareSpace,
                  charges,
                  loadingTime,
                  unloadingTime,
                },
              })
            }
          >
            Proceed to Summary
          </Button>
        </Col>
      </Row>
    </div>
  );
};

BookingDetails.propTypes = {
  selectedVehicle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    preferredArea: PropTypes.string.isRequired,
    capacity: PropTypes.number.isRequired,
    capacityUnit: PropTypes.string.isRequired,
    photoUrl: PropTypes.string.isRequired,
    chargePerKm: PropTypes.number.isRequired,
  }).isRequired,
};

export default BookingDetails;
