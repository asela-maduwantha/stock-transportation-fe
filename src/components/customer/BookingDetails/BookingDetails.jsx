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
} from "antd";
import {
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import httpService from "../../../services/httpService";

const { Option } = Select;
const { Title } = Typography;

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
      const response = await httpService.get(
        `/customer/calCharge/${selectedVehicle.id}?distance=${distance}`
      );
      setCharges(response.data);
    } catch (error) {
      message.error("Failed to fetch charges.");
    }
  }, [distance, selectedVehicle.id]);

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

  return (
    <div className="booking-details-form">
      <Title level={2}>Booking Details</Title>
      <Row gutter={[16, 16]}>
        <Col xs={20} md={12}>
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
              title={selectedVehicle.type}
              description={
                <>
                  <p>
                    <strong>Type:</strong> {selectedVehicle.type}
                  </p>
                  <p>
                    <strong>Preferred Area:</strong>{" "}
                    {selectedVehicle.preferredArea}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {selectedVehicle.capacity}{" "}
                    {selectedVehicle.capacityUnit}
                  </p>
                  <p>
                    <strong>Charge Per Km:</strong> LKR{" "}
                    {selectedVehicle.chargePerKm.toFixed(2)}
                  </p>
                </>
              }
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Pickup Location" style={{ marginBottom: 16 }}>
            <Autocomplete
              onLoad={onPickupLoad}
              onPlaceChanged={onPickupPlaceChanged}
            >
              <Input
                placeholder="Enter pickup location"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
              />
            </Autocomplete>
            <Row gutter={16}>
              <Col span={12}>
                <DatePicker
                  placeholder="Pickup Date"
                  style={{ width: "100%", margin: "16px 0" }}
                  onChange={(date, dateString) => setPickupDate(dateString)}
                  disabledDate={(current) =>
                    current && current < moment().startOf("day")
                  }
                />
              </Col>
              <Col span={12}>
                <TimePicker
                  placeholder="Pickup Time"
                  style={{ width: "100%", margin: "16px 0" }}
                  onChange={(time, timeString) => setPickupTime(timeString)}
                />
              </Col>
            </Row>

            <Autocomplete
              onLoad={onDropLoad}
              onPlaceChanged={onDropPlaceChanged}
            >
              <Input
                placeholder="Enter drop location"
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
              />
            </Autocomplete>
          </Card>

          <Card title="Booking Options" style={{ marginBottom: 16 }}>
            <Select
              defaultValue={1}
              style={{ width: "100%", marginBottom: "16px" }}
              onChange={(value) => {
                setCapacity(value);
                setShareSpace(value < 1);
              }}
            >
              <Option value={0.3}>1/3</Option>
              <Option value={0.5}>1/2</Option>
              <Option value={1}>1</Option>
            </Select>
            {capacity < 1 && (
              <Checkbox
                checked={shareSpace}
                onChange={(e) => setShareSpace(e.target.checked)}
                style={{ marginBottom: "16px" }}
              >
                Willing to Share{" "}
                <Popover
                  content="Sharing space with another customer allows you to split the cost but might increase the travel time."
                  title="Willing to Share"
                  trigger="click"
                >
                  <a href="#">More</a>
                </Popover>
              </Checkbox>
            )}
            <Checkbox
              checked={returnTrip}
              onChange={(e) => setReturnTrip(e.target.checked)}
              style={{ marginBottom: "16px" }}
            >
              Return Trip{" "}
              <Popover
                content="A return trip allows you to book the vehicle for a round trip, potentially saving on overall costs."
                title="Return Trip"
                trigger="click"
              >
                <a href="#">More</a>
              </Popover>
            </Checkbox>
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
          <div className="route-info">
            {formattedDistance && (
              <p>
                <strong>Distance:</strong> {formattedDistance}
              </p>
            )}
            {travelTime && (
              <p>
                <strong>Estimated Travel Time:</strong> {travelTime}
              </p>
            )}
          </div>
          <Button
            type="primary"
            block
            className="submit-button"
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
