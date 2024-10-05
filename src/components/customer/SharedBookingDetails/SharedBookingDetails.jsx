import React, { useState, useEffect, useCallback, useRef } from "react";
import {

  Form,

  message,
  Row,
  Col,
  Card,
  Typography,

} from "antd";

import httpService from "../../../services/httpService";
import { useLocation, useNavigate } from "react-router-dom";
import VehicleDetailsCard from "./VehicleDetailasCard";
import BookingForm from "./BookingForm";
import RouteMap from "./RouteMap";

const { Title } = Typography;

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
  const [firstNearbyLocation, setFirstNearbyLocation] = useState(null);
  const [lastNearbyLocation, setLastNearbyLocation] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [mapZoom] = useState(10);

  const mapRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const selectedBooking = location.state?.booking;

  useEffect(() => {
    setIsButtonDisabled(!isPickupValid || !isDropoffValid || !charge);
  }, [isPickupValid, isDropoffValid, charge]);

  useEffect(() => {
    if (!selectedBooking) {
      message.error("No booking details available");
    }
  }, [selectedBooking]);

  useEffect(() => {
    if (selectedBooking && selectedBooking.nearbyCities && selectedBooking.nearbyCities.length >= 2) {
      getLatLngFromAddress(selectedBooking.nearbyCities[0]).then(coords => {
        setFirstNearbyLocation(coords);
        setMapCenter(coords);
      });
      getLatLngFromAddress(selectedBooking.nearbyCities[selectedBooking.nearbyCities.length - 1]).then(coords => setLastNearbyLocation(coords));
    }
  }, [selectedBooking]);

  const getLatLngFromAddress = async (address) => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          reject(status);
        }
      });
    });
  };

  const getRoute = useCallback(async () => {
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
          setDirections(result);
          fitBoundsToRoute(result.routes[0]);
        } else {
          console.error(`Error fetching directions ${result}`);
        }
      }
    );
  }, [selectedBooking]);

  useEffect(() => {
    getRoute();
  }, [getRoute]);

  const fitBoundsToRoute = (route) => {
    if (mapRef.current && route.bounds) {
      mapRef.current.fitBounds(route.bounds);
    }
  };

  const calculateDistance = (point1, point2) => {
    return window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(point1.lat, point1.lng),
      new window.google.maps.LatLng(point2.lat, point2.lng)
    );
  };
  
  const isLocationOnRoute = (location, route) => {
    if (!route || !route.overview_path) return false;
    const threshold = 1000; // 1 km threshold
    for (let i = 0; i < route.overview_path.length; i++) {
      const pathPoint = route.overview_path[i];
      const distance = calculateDistance(location, { lat: pathPoint.lat(), lng: pathPoint.lng() });
      if (distance <= threshold) {
        return true;
      }
    }
    return false;
  };
  
  const validateLocation = async (location, isPickup) => {
    try {
      const locationCoords = await getLatLngFromAddress(location);
  
      if (route) {
        const isOnRoute = isLocationOnRoute(locationCoords, route);
        
        if (!isOnRoute) {
          message.error(`${isPickup ? "Pickup" : "Dropoff"} location must be on or near the route`);
          return false;
        }
  
        if (isPickup) {
          setPickupCoords(locationCoords);
          setIsPickupValid(true);
        } else {
          if (!pickupCoords) {
            message.error("Please set a valid pickup location first");
            return false;
          }
          
          const pickupDistanceToFirst = calculateDistance(pickupCoords, firstNearbyLocation);
          const pickupDistanceToLast = calculateDistance(pickupCoords, lastNearbyLocation);
          const dropoffDistanceToFirst = calculateDistance(locationCoords, firstNearbyLocation);
          const dropoffDistanceToLast = calculateDistance(locationCoords, lastNearbyLocation);
          
          if (dropoffDistanceToFirst < pickupDistanceToFirst || dropoffDistanceToLast > pickupDistanceToLast) {
            message.error("Dropoff location should be after the pickup location on the route");
            return false;
          }
          
          setDropoffCoords(locationCoords);
          setIsDropoffValid(true);
        }
  
        return true;
      }
  
      return false;
    } catch (error) {
      console.error("Location validation error:", error);
      message.error("Error validating location");
      return false;
    }
  };

  const handlePickupSelect = () => {
    const place = pickupAutocomplete.getPlace();
    const address = place.formatted_address;
    setPickupLocation(address);
    form.setFieldsValue({ pickupLocation: address });
    validateLocation(address, true).then((isValid) => {
      if (isValid) {
        calculateRouteIfBothValid();
      }
    });
  };

  const handleDropoffSelect = () => {
    const place = dropoffAutocomplete.getPlace();
    const address = place.formatted_address;
    setDropoffLocation(address);
    form.setFieldsValue({ dropoffLocation: address });
    validateLocation(address, false).then((isValid) => {
      if (isValid) {
        calculateRouteIfBothValid();
      }
    });
  };

  const calculateRouteIfBothValid = () => {
    if (isPickupValid && isDropoffValid) {
      calculateRoute();
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
          fitBoundsToRoute(route);
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
        await calculateCharge(distance);
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
          <VehicleDetailsCard vehicle={selectedBooking?.vehicle} booking={selectedBooking} />
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<Title level={4}>Your Stock Information</Title>} className="booking-details-card">
            <BookingForm 
              form={form}
              onSubmit={handleSubmit}
              maxCapacity={selectedBooking?.freeCapacity}
              capacityUnit={selectedBooking?.vehicle.capacityUnit}
              isButtonDisabled={isButtonDisabled}
              buttonStyle={isButtonDisabled ? disabledButtonStyle : enabledButtonStyle}
              setPickupAutocomplete={setPickupAutocomplete}
              setDropoffAutocomplete={setDropoffAutocomplete}
              handlePickupSelect={handlePickupSelect}
              handleDropoffSelect={handleDropoffSelect}
              pickupLocation={pickupLocation}
              setPickupLocation={setPickupLocation}
              dropoffLocation={dropoffLocation}
              setDropoffLocation={setDropoffLocation}
              loadingTime={loadingTime}
              setLoadingTime={setLoadingTime}
              unloadingTime={unloadingTime}
              setUnloadingTime={setUnloadingTime}
              setIsHovered={setIsHovered}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title={<Title level={4}>Route Map</Title>}>
            <RouteMap 
              mapRef={mapRef}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              pickupCoords={pickupCoords}
              dropoffCoords={dropoffCoords}
              directions={directions}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SharedBookingDetails;