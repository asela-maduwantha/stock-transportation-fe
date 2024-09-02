import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Card,
  Typography,
  Space,
  InputNumber,
} from "antd";
import { Autocomplete } from "@react-google-maps/api";
import { EnvironmentOutlined } from "@ant-design/icons";
import httpService from "../../../services/httpService";
import { useLocation, useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title, Text } = Typography;

const SharedBookingDetails = () => {
  const [form] = Form.useForm();
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [charge, setCharge] = useState(null);
  const [loadingTime, setLoadingTime] = useState(15);
  const [unloadingTime, setUnloadingTime] = useState(15);
  const [isHovered, setIsHovered] = useState(false);
  const [isPickupValid, setIsPickupValid] = useState(false);
  const [isDropoffValid, setIsDropoffValid] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [route, setRoute] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setIsButtonDisabled(!isPickupValid || !isDropoffValid || !charge);
  }, [isPickupValid, isDropoffValid, charge]);

  const location = useLocation();
  const navigate = useNavigate();
  const selectedBooking = location.state?.booking;

  useEffect(() => {
    if (!selectedBooking) {
      message.error("No booking details available");
    }
  }, [selectedBooking]);

  const getRoute = async () => {
    if (
      !selectedBooking ||
      !selectedBooking.nearbyCities ||
      selectedBooking.nearbyCities.length < 2
    ) {
      console.error("Invalid or missing nearby cities");
      return;
    }

    const origin = selectedBooking.nearbyCities[0];
    const destination =
      selectedBooking.nearbyCities[selectedBooking.nearbyCities.length - 1];

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setRoute(result.routes[0]);
        } else {
          console.error(`Error fetching directions ${result}`);
        }
      }
    );
  };

  useEffect(() => {
    getRoute();
  });

  const isLocationOnRoute = (location, route) => {
    const routeBounds = route.bounds;
    const locationLatLng = new window.google.maps.LatLng(
      location.lat,
      location.lng
    );
    return routeBounds.contains(locationLatLng);
  };

  const validateLocation = async (location, isPickup) => {
    const geocoder = new window.google.maps.Geocoder();

    try {
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: location }, (results, status) => {
          if (status === "OK") resolve(results[0]);
          else reject(status);
        });
      });

      const locationCoords = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
      };

      if (route) {
        const isValid = isLocationOnRoute(locationCoords, route);
        if (isPickup) {
          setIsPickupValid(isValid);
        } else {
          setIsDropoffValid(isValid);
        }
        if (!isValid) {
          message.error(
            `${isPickup ? "Pickup" : "Dropoff"} location must be on the route`
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Geocoding error:", error);
      message.error("Error validating location");
      return false;
    }
  };

  const calculateRoute = () => {
    const directionsService = new window.google.maps.DirectionsService();
    const origin = form.getFieldValue("pickupLocation");
    const destination = form.getFieldValue("dropoffLocation");
  
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          const route = result.routes[0];
          const distanceInKm = route.legs[0].distance.value / 1000;
          setDistance(distanceInKm);
          setDuration(route.legs[0].duration.value / 60);
          calculateCharge(distanceInKm);
        } else {
          console.error(`Error fetching directions ${result}`);
        }
      }
    );
  };
  
  const calculateCharge = async (distance) => {
    try {
      const response = await httpService.post(
        "/customer/calCharge",
        {
          vehicleId: selectedBooking.vehicle.id,
          distance: distance,
          returnTrip: false,
        }
      );
      setCharge(response.data);
      setIsButtonDisabled(false); 
    } catch (error) {
      console.error("Error calculating charge:", error);
      message.error("Failed to calculate charge");
    }
  };

  const handlePickupSelect = () => {
    const place = pickupAutocomplete.getPlace();
    const address = place.formatted_address;
    setPickupLocation(address);
    form.setFieldsValue({ pickupLocation: address });
    validateLocation(address, true).then((isValid) => {
      if (isValid ) {
        calculateRoute();
      }
    });
  };

  const handleDropoffSelect = () => {
    const place = dropoffAutocomplete.getPlace();
    const address = place.formatted_address;
    setDropoffLocation(address);
    form.setFieldsValue({ dropoffLocation: address });
    validateLocation(address, false).then((isValid) => {
      if (isValid ) {
        calculateRoute();
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (!isPickupValid || !isDropoffValid) {
        message.error("Please select valid pickup and dropoff locations");
        return;
      }

      if (!directions) {
        message.error("Please select valid pickup and dropoff locations");
        return;
      }

      if (!charge) {
        await calculateCharge();
      }

      const bookingData = {
        ...selectedBooking,
        bookingId: selectedBooking.id,
        startLat: directions.routes[0].legs[0].start_location.lat(),
        startLong: directions.routes[0].legs[0].start_location.lng(),
        destLat: directions.routes[0].legs[0].end_location.lat(),
        destLong: directions.routes[0].legs[0].end_location.lng(),
        travellingTime: duration,
        avgHandlingTime: loadingTime + unloadingTime,
        vehicleCharge: charge?.vehicleCharge,
        serviceCharge: charge?.serviceCharge,
        advancePayment: charge?.advancePayment,
        status: "upcoming",
        isCancelled: false,
        capacity: values.capacity,
        selectedVehicle: selectedBooking.vehicle,
        pickupLocation: values.pickupLocation,
        dropoffLocation: values.dropoffLocation,
        distance: distance,
        loadingTime: loadingTime,
        unloadingTime: unloadingTime,
      };

      navigate("/customer/shared-booking-summary", { state: { bookingData } });

      message.success("Shared booking created successfully");
      form.resetFields();
    } catch (error) {
      console.error("Error creating shared booking:", error);
      message.error("Failed to create shared booking");
    }
  };

  const enabledButtonStyle = {
    backgroundColor: isHovered ? "#fdb940" : "#fdb940",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "normal",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease, opacity 0.3s ease",
    opacity: isHovered ? "0.8" : "1",
  };
  
  const disabledButtonStyle = {
    ...enabledButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: "#ccc",
  };


  return (
    <div className="booking-details-form">
      <Title level={2}>Shared Booking Details</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            cover={
              <img
                alt={selectedBooking.vehicle.type}
                src={selectedBooking.vehicle.photoUrl}
                style={{ objectFit: "cover", height: "300px" }}
              />
            }
          >
            <Card.Meta
              title={<Title level={3}>{selectedBooking.vehicle.type}</Title>}
              description={
                <Space direction="vertical" size="small">
                  <Text>
                    <strong>Type:</strong> {selectedBooking.vehicle.type}
                  </Text>
                  <Text>
                    <strong>Preferred Area:</strong>{" "}
                    {selectedBooking.vehicle.preferredArea}
                  </Text>
                  <Text>
                    <strong>Capacity:</strong>{" "}
                    {selectedBooking.vehicle.capacity}{" "}
                    {selectedBooking.vehicle.capacityUnit}
                  </Text>
                  <Text>
                    <strong>Free Capacity:</strong>{" "}
                    {selectedBooking.freeCapacity}{" "}
                    {selectedBooking.vehicle.capacityUnit}
                  </Text>
                  <Text>
                    <strong>Booking Date:</strong>{" "}
                    {new Date(selectedBooking.bookingDate).toLocaleDateString()}
                  </Text>
                  <Text>
                    <strong>Pickup Time:</strong> {selectedBooking.pickupTime}
                  </Text>
                  <Text>
                    <strong>End Time:</strong> {selectedBooking.endTime}
                  </Text>
                  <Text>
                    <strong>Nearby Cities:</strong>{" "}
                    {selectedBooking.nearbyCities.join(", ")}
                  </Text>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<Title level={4}>Your Stock Information</Title>}
            className="booking-details-card"
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="capacity"
                label={<Text strong>Required Capacity</Text>}
                rules={[
                  {
                    required: true,
                    message: "Please input the required capacity",
                  },
                  {
                    type: "number",
                    min: 0.1,
                    max: selectedBooking?.freeCapacity,
                    message: `Capacity must be between 0.1 and ${selectedBooking?.freeCapacity}`,
                  },
                ]}
              >
                <InputNumber
                  step={0.1}
                  min={0.1}
                  max={selectedBooking?.freeCapacity}
                  addonAfter={selectedBooking?.vehicle.capacityUnit}
                />
              </Form.Item>

              <Form.Item
                name="pickupLocation"
                label={<Text strong>Pickup Location</Text>}
                rules={[
                  {
                    required: true,
                    message: "Please input your pickup location",
                  },
                ]}
              >
                <Autocomplete
                  onLoad={(autocomplete) => setPickupAutocomplete(autocomplete)}
                  onPlaceChanged={handlePickupSelect}
                >
                  <Input
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    prefix={<EnvironmentOutlined />}
                    placeholder="Enter pickup location"
                  />
                </Autocomplete>
              </Form.Item>

              <Form.Item
                name="dropoffLocation"
                label={<Text strong>Dropoff Location</Text>}
                rules={[
                  {
                    required: true,
                    message: "Please input your dropoff location",
                  },
                ]}
              >
                <Autocomplete
                  onLoad={(autocomplete) =>
                    setDropoffAutocomplete(autocomplete)
                  }
                  onPlaceChanged={handleDropoffSelect}
                >
                  <Input
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    prefix={<EnvironmentOutlined />}
                    placeholder="Enter drop-off location"
                  />
                </Autocomplete>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="loadingTime"
                    label={<Text strong>Loading Time</Text>}
                    rules={[
                      { required: true, message: "Please select loading time" },
                    ]}
                  >
                    <Select
                      value={loadingTime}
                      onChange={(value) => setLoadingTime(value)}
                    >
                      <Option value={15}>15 minutes</Option>
                      <Option value={30}>30 minutes</Option>
                      <Option value={60}>60 minutes</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="unloadingTime"
                    label={<Text strong>Unloading Time</Text>}
                    rules={[
                      {
                        required: true,
                        message: "Please select unloading time",
                      },
                    ]}
                  >
                    <Select
                      value={unloadingTime}
                      onChange={(value) => setUnloadingTime(value)}
                    >
                      <Option value={15}>15 minutes</Option>
                      <Option value={30}>30 minutes</Option>
                      <Option value={60}>60 minutes</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
              <Button
  type="primary"
  htmlType="submit"
  style={isButtonDisabled ? disabledButtonStyle : enabledButtonStyle}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  disabled={isButtonDisabled}
  title={isButtonDisabled ? "Please select valid pickup and dropoff locations" : ""}
>
  Proceed to Summary
</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SharedBookingDetails;
