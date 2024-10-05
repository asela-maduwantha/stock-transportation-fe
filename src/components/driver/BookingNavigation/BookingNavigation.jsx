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
  const [loadingTimers, setLoadingTimers] = useState({});
  const [unloadingTimers, setUnloadingTimers] = useState({});
  const [isLoading, setIsLoading] = useState({});
  const [isUnloading, setIsUnloading] = useState({});
  const socketRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    libraries: ['places'],
  });

  const buttonStyle = {
    backgroundColor: '#fdb940',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, opacity 0.3s ease',
    margin: '0 5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  useEffect(() => {
    socketRef.current = io('https://stocktrans.azurewebsites.net/');
    socketRef.current.on('timerUpdate', handleTimerUpdate);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleTimerUpdate = (data) => {
    const { type, time, stockId } = data;
    if (type === 'loading') {
      setLoadingTimers(prev => ({ ...prev, [stockId]: time }));
    } else if (type === 'unloading') {
      setUnloadingTimers(prev => ({ ...prev, [stockId]: time }));
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
    if (coordinates && isLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      const getAddress = async (lat, lng) => {
        try {
          const result = await geocoder.geocode({ location: { lat, lng } });
          return result.results[0].formatted_address;
        } catch (error) {
          console.error("Geocoding error:", error);
          return "Address not found";
        }
      };

      const processLocations = async () => {
        if (isSharedBooking) {
          const locations = [
            { lat: coordinates.firstLat, lng: coordinates.firstLong, type: 'pickup', label: '1st Stock Pickup', stockId: 'stock1' },
            { lat: coordinates.secondLat, lng: coordinates.secondLong, type: 'drop', label: '1st Stock Drop', stockId: 'stock1' },
            { lat: coordinates.thirdLat, lng: coordinates.thirdLong, type: 'pickup', label: '2nd Stock Pickup', stockId: 'stock2' },
            { lat: coordinates.fourthLat, lng: coordinates.fourthLong, type: 'drop', label: '2nd Stock Drop', stockId: 'stock2' },
          ];

          for (let location of locations) {
            location.address = await getAddress(location.lat, location.lng);
          }

          // Reorder the route: all pickups first, then drops
          const pickups = locations.filter(loc => loc.type === 'pickup');
          const drops = locations.filter(loc => loc.type === 'drop').reverse();
          setRoute([...pickups, ...drops]);
        } else {
          const pickupAddress = await getAddress(coordinates.firstLat, coordinates.firstLong);
          const dropAddress = await getAddress(coordinates.secondLat, coordinates.secondLong);

          setRoute([
            { lat: coordinates.firstLat, lng: coordinates.firstLong, type: 'pickup', label: 'Pickup', address: pickupAddress, stockId: 'stock1' },
            { lat: coordinates.secondLat, lng: coordinates.secondLong, type: 'drop', label: 'Drop', address: dropAddress, stockId: 'stock1' },
          ]);
        }
      };

      processLocations();
    }
  }, [coordinates, isSharedBooking, isLoaded]);

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

  const startLoading = async (stockId) => {
    try {
      await httpService.post(`/driver/startLoading/${location.state.originalBookingId}`, { stockId });
      setIsLoading(prev => ({ ...prev, [stockId]: true }));
      message.success(`Loading started for ${stockId}`);
    } catch (error) {
      console.error("Error starting loading:", error);
      message.error("Failed to start loading");
    }
  };

  const stopLoading = async (stockId) => {
    try {
      await httpService.put(`/driver/stopLoading/${location.state.originalBookingId}`, {
        bookingType: "original",
        stockId
      });
      setIsLoading(prev => ({ ...prev, [stockId]: false }));
      message.success(`Loading stopped for ${stockId}`);
    } catch (error) {
      console.error("Error stopping loading:", error);
      message.error("Failed to stop loading");
    }
  };

  const startUnloading = async (stockId) => {
    try {
      await httpService.post(`/driver/startUnloading/${location.state.originalBookingId}`, { stockId });
      setIsUnloading(prev => ({ ...prev, [stockId]: true }));
      message.success(`Unloading started for ${stockId}`);
    } catch (error) {
      console.error("Error starting unloading:", error);
      message.error("Failed to start unloading");
    }
  };

  const stopUnloading = async (stockId) => {
    try {
      await httpService.put(`/driver/stopUnloading/${location.state.originalBookingId}`, {
        bookingType: "original",
        stockId
      });
      setIsUnloading(prev => ({ ...prev, [stockId]: false }));
      message.success(`Unloading stopped for ${stockId}`);
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderLocationItem = (location) => {
    const isPickup = location.type === 'pickup';
    const icon = isPickup ? <EnvironmentOutlined /> : <CompassOutlined />;
    const actionButton = isPickup ? (
      isLoading[location.stockId] ? (
        <Button onClick={() => stopLoading(location.stockId)} style={{...buttonStyle, backgroundColor: '#ff4d4f'}}>Stop Loading</Button>
      ) : (
        <Button onClick={() => startLoading(location.stockId)} style={buttonStyle}>Start Loading</Button>
      )
    ) : (
      isUnloading[location.stockId] ? (
        <Button onClick={() => stopUnloading(location.stockId)} style={{...buttonStyle, backgroundColor: '#ff4d4f'}}>Stop Unloading</Button>
      ) : (
        <Button onClick={() => startUnloading(location.stockId)} style={buttonStyle}>Start Unloading</Button>
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
        {(isPickup && isLoading[location.stockId]) || (!isPickup && isUnloading[location.stockId]) ? (
          <Text style={{ marginLeft: 10 }}>
            <ClockCircleOutlined /> {formatTime(isPickup ? loadingTimers[location.stockId] : unloadingTimers[location.stockId])}
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

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Card 
        title={<Title level={3}>Booking Navigation</Title>} 
        style={{ width: '100%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '12px' }}
      >
        <Text strong style={{ fontSize: '18px', marginBottom: '20px', display: 'block' }}>
          {isSharedBooking ? 'Shared Booking' : 'Single Booking'}
        </Text>
        
        <div style={{ height: '400px', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={userLocation || (route[0] ? { lat: route[0].lat, lng: route[0].lng } : { lat: 0, lng: 0 })}
            zoom={12}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            onLoad={map => {
              mapRef.current = map;
            }}
          >
            {directions && <DirectionsRenderer directions={directions} />}
            {route.map((location, index) => (
              <Marker
                key={index}
                position={{ lat: location.lat, lng: location.lng }}
                label={`${index + 1}`}
                icon={{
                  url: location.type === 'pickup' ? 'path_to_pickup_icon.png' : 'path_to_dropoff_icon.png',
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
              />
            ))}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: 'path_to_driver_icon.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
          </GoogleMap>
        </div>

        <List
          style={{ 
            marginTop: 16, 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px', 
            padding: '16px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
          dataSource={route}
          renderItem={renderLocationItem}
        />

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {!rideStarted ? (
            <Button
              onClick={startRide}
              style={{...buttonStyle, fontSize: '16px'}}
              icon={<PlayCircleOutlined />}
            >
              Start Ride
            </Button>
          ) : (
            <>
              <Text style={{ width: '100%', textAlign: 'center', marginBottom: '10px', fontSize: '18px' }}>
                Current Step: {step + 1} of {route.length}
              </Text>
              <Button
                onClick={handleNextStep}
                style={{...buttonStyle, fontSize: '16px'}}
                icon={<CompassOutlined />}
                disabled={step === route.length - 1}
              >
                {step === route.length - 1 ? 'Trip Completed' : 'Next Location'}
              </Button>
            </>
          )}
          <Button
            onClick={handleNavigate}
            style={{...buttonStyle, fontSize: '16px'}}
            disabled={!rideStarted}
          >
            Navigate
          </Button>
          <Button
            onClick={openInGoogleMaps}
            style={{...buttonStyle, fontSize: '16px'}}
            disabled={!rideStarted}
          >
            Open in Google Maps
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BookingNavigation;