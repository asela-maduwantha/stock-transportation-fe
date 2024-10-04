import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, List, Button, Typography, message, Spin, Modal } from 'antd';
import { EnvironmentOutlined, CompassOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { GoogleMap, DirectionsRenderer, Marker, useJsApiLoader } from '@react-google-maps/api';
import httpService from '../../../services/httpService';
import io from 'socket.io-client';

const { Title, Text } = Typography;

const BookingNavigation = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [step, setStep] = useState(0);
  const [coordinates, setCoordinates] = useState(null);
  const [isSharedBooking, setIsSharedBooking] = useState(false);
  const [route, setRoute] = useState([]);
  const [rideStarted, setRideStarted] = useState(false);
  const watchPositionId = useRef(null);
  const [loadingTimer, setLoadingTimer] = useState(0);
  const [unloadingTimer, setUnloadingTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnloading, setIsUnloading] = useState(false);
  const socketRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyA4AnscOsaLsNUGrCnWrJH-k8XlBsltPgM",
    libraries: ['places'],
  });

  const buttonStyle = {
    backgroundColor: '#fdb940',
    color: '#fff',
    fontWeight: 'normal',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, opacity 0.3s ease',
    margin: '0 5px',
  };

  useEffect(() => {
    socketRef.current = io('YOUR_SOCKET_SERVER_URL');
    socketRef.current.on('timerUpdate', handleTimerUpdate);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleTimerUpdate = (data) => {
    if (data.type === 'loading') {
      setLoadingTimer(data.time);
    } else if (data.type === 'unloading') {
      setUnloadingTimer(data.time);
    }
  };

  const fetchCoordinates = useCallback(async () => {
    try {
      const response = await httpService.get(`driver/getCoordinates/${location.state.originalBookingId}`, {
        params: { bookingType: location.state.bookingType }
      });
      setCoordinates(response.data);
      setIsSharedBooking(Object.keys(response.data).length === 8);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      message.error("Failed to fetch booking coordinates. Please try again.");
      setLoading(false);
    }
  }, [location.state.bookingType, location.state.originalBookingId]);

  useEffect(() => {
    if (isLoaded) {
      requestLocationAccess();
      fetchCoordinates();
    }
  }, [isLoaded, fetchCoordinates]);

  useEffect(() => {
    if (coordinates && isSharedBooking) {
      const locations = [
        { lat: coordinates.firstLat, lng: coordinates.firstLong, type: 'pickup', label: '1st Stock Pickup', address: coordinates.firstAddress },
        { lat: coordinates.secondLat, lng: coordinates.secondLong, type: 'drop', label: '1st Stock Drop', address: coordinates.secondAddress },
        { lat: coordinates.thirdLat, lng: coordinates.thirdLong, type: 'pickup', label: '2nd Stock Pickup', address: coordinates.thirdAddress },
        { lat: coordinates.fourthLat, lng: coordinates.fourthLong, type: 'drop', label: '2nd Stock Drop', address: coordinates.fourthAddress },
      ];

      const distanceToSecond = calculateDistance(locations[0], locations[1]);
      const distanceToFourth = calculateDistance(locations[0], locations[3]);

      setRoute(distanceToFourth < distanceToSecond ? [locations[0], locations[2], locations[1], locations[3]] : locations);
    } else if (coordinates) {
      setRoute([
        { lat: coordinates.firstLat, lng: coordinates.firstLong, type: 'pickup', label: 'Pickup', address: coordinates.firstAddress },
        { lat: coordinates.secondLat, lng: coordinates.secondLong, type: 'drop', label: 'Drop', address: coordinates.secondAddress },
      ]);
    }
  }, [coordinates, isSharedBooking]);

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const requestLocationAccess = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          message.error("Unable to access your location. Please enable location services.");
        }
      );
    } else {
      message.error("Geolocation is not supported by your browser.");
    }
  };

  const handleNavigate = useCallback(() => {
    if (userLocation && route[step]) {
      const directionsService = new window.google.maps.DirectionsService();
      const destination = new window.google.maps.LatLng(route[step].lat, route[step].lng);

      directionsService.route(
        {
          origin: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Error fetching directions ${result}`);
            message.error("Failed to fetch directions. Please try again.");
          }
        }
      );
    } else {
      Modal.confirm({
        title: 'Location Access Required',
        content: 'Location access is required for navigation. Allow access?',
        onOk: () => requestLocationAccess(),
        onCancel: () => console.log('Location access denied'),
      });
    }
  }, [userLocation, route, step]);

  const handleNextStep = useCallback(() => {
    if (step < route.length - 1) {
      setStep(prevStep => prevStep + 1);
      setDirections(null);
    } else {
      message.success('Trip completed!');
    }
  }, [step, route.length]);

  useEffect(() => {
    if (rideStarted) {
      handleNavigate();
    }
  }, [rideStarted, step, handleNavigate]);

  const openInGoogleMaps = () => {
    if (route[step]) {
      const destination = `${route[step].lat},${route[step].lng}`;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
      window.open(url, '_blank');
    } else {
      message.error("Invalid step");
    }
  };

  const startRide = async () => {
    if (!userLocation) {
      message.error("Unable to access your location. Please enable location services.");
      return;
    }

    const driverId = localStorage.getItem('driverId');
    if (!driverId) {
      message.error("Driver ID not found. Please log in again.");
      return;
    }

    try {
      const response = await httpService.post('/driver/startRide', {
        id: driverId,
        bookingId: location.state.originalBookingId,
        bookingType: location.state.bookingType,
        longitude: userLocation.lng,
        latitude: userLocation.lat
      });

      if (response.status === 200) {
        message.success("Ride started successfully!");
        setRideStarted(true);
        startLocationTracking();
        handleNavigate();
      }
    } catch (error) {
      console.error("Error starting ride:", error);
      message.error("Failed to start the ride. Please try again.");
    }
  };

  const startLocationTracking = () => {
    if ("geolocation" in navigator) {
      watchPositionId.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          sendCoordinates(newLocation);
        },
        (error) => {
          console.error("Error tracking location:", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const sendCoordinates = async (location) => {
    try {
      await httpService.post('/driver/sendCoordinates', {
        bookingId: location.state.originalBookingId,
        longitude: location.lng,
        latitude: location.lat
      });
    } catch (error) {
      console.error("Error sending coordinates:", error);
    }
  };

  const startLoading = async () => {
    try {
      await httpService.post(`/driver/startLoading/${location.state.originalBookingId}`);
      setIsLoading(true);
      message.success("Loading started");
    } catch (error) {
      console.error("Error starting loading:", error);
      message.error("Failed to start loading");
    }
  };

  const stopLoading = async () => {
    try {
      await httpService.put(`/driver/stopLoading/${location.state.originalBookingId}`, {
        bookingType: "original"
      });
      setIsLoading(false);
      message.success("Loading stopped");
      handleNextStep();
    } catch (error) {
      console.error("Error stopping loading:", error);
      message.error("Failed to stop loading");
    }
  };

  const startUnloading = async () => {
    try {
      await httpService.post(`/driver/startUnloading/${location.state.originalBookingId}`);
      setIsUnloading(true);
      message.success("Unloading started");
    } catch (error) {
      console.error("Error starting unloading:", error);
      message.error("Failed to start unloading");
    }
  };

  const stopUnloading = async () => {
    try {
      await httpService.put(`/driver/stopUnloading/${location.state.originalBookingId}`, {
        bookingType: "original"
      });
      setIsUnloading(false);
      message.success("Unloading stopped");
      handleNextStep();
    } catch (error) {
      console.error("Error stopping unloading:", error);
      message.error("Failed to stop unloading");
    }
  };

  useEffect(() => {
    return () => {
      if (watchPositionId.current) {
        navigator.geolocation.clearWatch(watchPositionId.current);
      }
    };
  }, []);

  const renderLocationItem = (location) => {
    const isPickup = location.type === 'pickup';
    const icon = isPickup ? <EnvironmentOutlined /> : <CompassOutlined />;
    const actionButton = isPickup ? (
      isLoading ? (
        <Button onClick={stopLoading} style={{...buttonStyle, backgroundColor: '#ff4d4f'}}>Stop Loading</Button>
      ) : (
        <Button onClick={startLoading} style={buttonStyle}>Start Loading</Button>
      )
    ) : (
      isUnloading ? (
        <Button onClick={stopUnloading} style={{...buttonStyle, backgroundColor: '#ff4d4f'}}>Stop Unloading</Button>
      ) : (
        <Button onClick={startUnloading} style={buttonStyle}>Start Unloading</Button>
      )
    );

    return (
      <List.Item>
        <List.Item.Meta
          avatar={icon}
          title={`${location.label}: ${location.address}`}
          description={`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
        />
        {actionButton}
        {(isPickup && isLoading) || (!isPickup && isUnloading) ? (
          <Text style={{ marginLeft: 10 }}>
            <ClockCircleOutlined /> {isPickup ? loadingTimer : unloadingTimer}s
          </Text>
        ) : null}
      </List.Item>
    );
  };

  if (loading || !isLoaded || !coordinates) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <Text style={{ marginLeft: 10 }}>Loading navigation details...</Text>
      </div>
    );
  }

 // ... (previous code remains the same)

 return (
  <Card title={<Title level={3}>Booking Navigation</Title>} style={{ width: '100%', maxWidth: 800, margin: '20px auto' }}>
    <Text strong>{isSharedBooking ? 'Shared Booking' : 'Single Booking'}</Text>
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px' }}
      center={userLocation || { lat: 0, lng: 0 }}
      zoom={10}
    >
      {directions && <DirectionsRenderer directions={directions} />}
      {route.map((location, index) => (
        <Marker
          key={index}
          position={{ lat: location.lat, lng: location.lng }}
          label={location.label}
        />
      ))}
      {userLocation && <Marker position={userLocation} label="You" />}
    </GoogleMap>

    <List
      style={{ marginTop: 16 }}
      dataSource={route}
      renderItem={renderLocationItem}
    />

    <div style={{ marginTop: 16, textAlign: 'center' }}>
      {!rideStarted ? (
        <Button
          onClick={startRide}
          style={buttonStyle}
          icon={<PlayCircleOutlined />}
        >
          Start Ride
        </Button>
      ) : (
        <>
          <Text>Current Step: {step + 1} of {route.length}</Text>
          <Button
            onClick={handleNextStep}
            style={buttonStyle}
            icon={<CompassOutlined />}
            disabled={step === route.length - 1}
          >
            {step === route.length - 1 ? 'Trip Completed' : 'Next Location'}
          </Button>
        </>
      )}
    </div>

    <div style={{ marginTop: 16, textAlign: 'center' }}>
      <Button
        onClick={handleNavigate}
        style={buttonStyle}
        disabled={!rideStarted}
      >
        Navigate
      </Button>
      <Button
        onClick={openInGoogleMaps}
        style={buttonStyle}
        disabled={!rideStarted}
      >
        Open in Google Maps
      </Button>
    </div>
  </Card>
);
};

export default BookingNavigation;