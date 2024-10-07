import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, List, Button, Typography, message, Spin, Modal, Divider } from 'antd';
import { EnvironmentOutlined, CompassOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { GoogleMap, DirectionsRenderer, Marker, useJsApiLoader } from '@react-google-maps/api';
import httpService from '../../../services/httpService';
import io from 'socket.io-client';

const { Title, Text } = Typography;

const BookingNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [step, setStep] = useState(0);
  const [coordinates, setCoordinates] = useState(null);
  const [isSharedBooking, setIsSharedBooking] = useState(false);
  const [pickups, setPickups] = useState([]);
  const [drops, setDrops] = useState([]);
  const [rideStarted, setRideStarted] = useState(false);
  const watchPositionId = useRef(null);
  const [loadingTimers, setLoadingTimers] = useState({});
  const [unloadingTimers, setUnloadingTimers] = useState({});
  const [isLoading, setIsLoading] = useState({});
  const [isUnloading, setIsUnloading] = useState({});
  const [loadingFinished, setLoadingFinished] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);
  const socketRef = useRef(null);
  const mapRef = useRef(null);
  const handleNextStepRef = useRef();
  const [currentLocationAddress, setCurrentLocationAddress] = useState('');

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyA4AnscOsaLsNUGrCnWrJH-k8XlBsltPgM",
  });

  const buttonStyle = {
    backgroundColor: '#fdb940',
    color: '#fff',
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
    if (!location.state || !location.state.originalBookingId || !location.state.bookingType) {
      message.error("Booking information is missing. Redirecting to dashboard.");
      navigate('/dashboard');
      return;
    }
    localStorage.setItem('bookingId', location.state.originalBookingId);

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
  }, [location.state, navigate]);

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
          const newPickups = [
            { lat: coordinates.firstLat, lng: coordinates.firstLong, type: 'pickup', label: 'Original Stock Pickup', stockId: 'stock1' },
            { lat: coordinates.thirdLat, lng: coordinates.thirdLong, type: 'pickup', label: 'Shared Stock Pickup', stockId: 'stock2' },
          ];
          const newDrops = [
            { lat: coordinates.fourthLat, lng: coordinates.fourthLong, type: 'drop', label: 'Shared Stock Drop', stockId: 'stock2' },
            { lat: coordinates.secondLat, lng: coordinates.secondLong, type: 'drop', label: 'Original Stock Drop', stockId: 'stock1' },
          ];

          for (let location of [...newPickups, ...newDrops]) {
            location.address = await getAddress(location.lat, location.lng);
          }

          setPickups(newPickups);
          setDrops(newDrops);
        } else {
          const pickupAddress = await getAddress(coordinates.firstLat, coordinates.firstLong);
          const dropAddress = await getAddress(coordinates.secondLat, coordinates.secondLong);

          setPickups([{ lat: coordinates.firstLat, lng: coordinates.firstLong, type: 'pickup', label: 'Pickup', address: pickupAddress, stockId: 'stock1' }]);
          setDrops([{ lat: coordinates.secondLat, lng: coordinates.secondLong, type: 'drop', label: 'Drop', address: dropAddress, stockId: 'stock1' }]);
        }
      };

      processLocations();
    }
  }, [coordinates, isSharedBooking, isLoaded]);

  useEffect(() => {
    if (isLoaded && userLocation) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: userLocation }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            setCurrentLocationAddress(results[0].formatted_address);
          } else {
            setCurrentLocationAddress('Address not found');
          }
        } else {
          console.error('Geocoder failed due to: ' + status);
          setCurrentLocationAddress('Unable to retrieve address');
        }
      });
    }
  }, [isLoaded, userLocation]);

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
        },
        { enableHighAccuracy: true, timeout: 600000, maximumAge: 0 }
      );
    } else {
      message.error("Geolocation is not supported by your browser.");
    }
  };

  const handleNavigate = useCallback(() => {
    if (!userLocation || ![...pickups, ...drops][step]) {
      Modal.confirm({
        title: 'Location Access Required',
        content: 'Location access is required for navigation. Allow access?',
        onOk: () => requestLocationAccess(),
        onCancel: () => console.log('Location access denied'),
      });
      return;
    }
  
    const directionsService = new window.google.maps.DirectionsService();
    const destination = new window.google.maps.LatLng([...pickups, ...drops][step].lat, [...pickups, ...drops][step].lng);
  
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          message.error("Failed to fetch directions. Please try again.");
        }
      }
    );
  }, [userLocation, pickups, drops, step]);

  useEffect(() => {
    if (rideStarted) {
      handleNavigate();
    }
  }, [rideStarted, step, handleNavigate]);

  const openInGoogleMaps = () => {
    const currentLocation = [...pickups, ...drops][step];
    if (currentLocation) {
      const destination = `${currentLocation.lat},${currentLocation.lng}`;
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

    if (!location.state || !location.state.originalBookingId || !location.state.bookingType) {
      message.error("Booking information is missing. Please start over.");
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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const initialLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(initialLocation);
          sendCoordinates(initialLocation);
          
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
              message.error("Failed to track location. Please check your device settings.");
            },
            { enableHighAccuracy: true, timeout: 600000, maximumAge: 0 }
          );
        },
        (error) => {
          console.error("Initial location fetch error:", error);
          message.error("Unable to access your location. Please enable location services.");
        }
      );
    }
  };

  const stopLocationTracking = useCallback(() => {
    if (watchPositionId.current) {
      navigator.geolocation.clearWatch(watchPositionId.current);
      watchPositionId.current = null;
    }
  }, []);

  const handleNextStep = useCallback(() => {
    if (step < [...pickups, ...drops].length - 1) {
      setStep(prevStep => prevStep + 1);
      setDirections(null);
    } else {
      message.success('Trip completed!');
      navigate('/driver/dashboard');
    }
  }, [step, pickups, drops, navigate]);
  
  handleNextStepRef.current = handleNextStep;

  const stopRideForLocation = useCallback(async (location) => {
    const driverId = localStorage.getItem('driverId');
    let bookingId = localStorage.getItem('bookingId');
    //const sharedBookingId = localStorage.getItem('sharedBookingId');

    if (!driverId || !bookingId) {
      message.error("Driver ID or Booking ID not found. Please log in again.");
      return;
    }

    try {
      let currentBookingType = "original";
      let currentBookingId = bookingId;

      if (isSharedBooking && (location.stockId === 'stock2')) {
        currentBookingType = "shared";
        currentBookingId = localStorage.getItem('sharedBookingId');
      }
      console.log(location)
      console.log(currentBookingId)
      console.log(currentBookingType)

      const response = await httpService.put(`/driver/stopRide/${driverId}`, {
        bookingId: currentBookingId,
        bookingType: currentBookingType,
        rideType: location.type
      });

      if (response.status === 200) {
        message.success(`Ride stopped for ${location.label}`);
        setCompletedSteps(prev => [...prev, step]);
        
        if (step === [...pickups, ...drops].length - 1) {
          // This is the final stop
          setRideStarted(false);
          stopLocationTracking();
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
          navigate('/driver/dashboard');
        } else {
          handleNextStep();
        }
      }
    } catch (error) {
      console.error("Error stopping ride:", error);
      message.error("Failed to stop the ride. Please try again.");
    }
  }, [isSharedBooking, navigate, pickups, drops, step, stopLocationTracking, handleNextStep]);

  const sendCoordinates = async (location) => {
    try {
      await httpService.post('/driver/sendCoordinates', {
        bookingId: localStorage.getItem('bookingId'),
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
        bookingType: isSharedBooking ? "shared" : "original",
        stockId
      });
      setIsLoading(prev => ({ ...prev, [stockId]: false }));
      setLoadingFinished(prev => ({ ...prev, [stockId]: true }));
      message.success(`Loading stopped for ${stockId}`);
      handleNextStep();
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
        bookingType: isSharedBooking ? "shared" : "original",
        stockId
      });
      setIsUnloading(prev => ({ ...prev, [stockId]: false }));
      message.success(`Unloading stopped for ${stockId}`);
      handleNextStep();
    } catch (error) {
      console.error("Error stopping unloading:", error);
      message.error("Failed to stop unloading");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderLocationItem = (location, index, isPickup) => {
    const icon = isPickup ? <EnvironmentOutlined /> : <CompassOutlined />;
    const isCurrentStep = step === (isPickup ? index : pickups.length + index);
    const isPreviousStepCompleted = isCurrentStep ? (step > 0 ? completedSteps.includes(step - 1) : true) : completedSteps.includes(step);
    const isStepCompleted = completedSteps.includes(isPickup ? index : pickups.length + index);

    const renderActionButtons = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!isStepCompleted && (
          <Button
            onClick={() => stopRideForLocation(location)}
            style={{...buttonStyle, backgroundColor: '#ff4d4f'}}
            disabled={!rideStarted || !isCurrentStep}
          >
            Stop Ride for {location.label}
          </Button>
        )}
        {isPickup ? (
          <>
            {isLoading[location.stockId] ? (
              <Button onClick={() => stopLoading(location.stockId)} style={{...buttonStyle, backgroundColor: '#ff4d4f'}} disabled={!isCurrentStep}>
                Stop Loading
              </Button>
            ) : (
              <Button onClick={() => startLoading(location.stockId)} style={buttonStyle} disabled={!rideStarted || !isCurrentStep || isStepCompleted}>
                Start Loading
              </Button>
            )}
          </>
        ) : (
          <>
            {isUnloading[location.stockId] ? (
              <Button onClick={() => stopUnloading(location.stockId)} style={{...buttonStyle, backgroundColor: '#ff4d4f'}} disabled={!isCurrentStep}>
                Stop Unloading
              </Button>
            ) : (
              <Button 
                onClick={() => startUnloading(location.stockId)} 
                style={buttonStyle} 
                disabled={!rideStarted || !isCurrentStep || !isPreviousStepCompleted || isStepCompleted || !loadingFinished[location.stockId]}
              >
                Start Unloading
              </Button>
            )}
          </>
        )}
      </div>
    );

    return (
      <List.Item>
        <List.Item.Meta
          avatar={icon}
          title={`${location.label}: ${location.address}`}
          description={`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
        />
        {renderActionButtons()}
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

  const allLocations = [
    { 
      lat: userLocation?.lat, 
      lng: userLocation?.lng, 
      type: 'current', 
      label: 'Current Location', 
      address: currentLocationAddress 
    },
    ...pickups,
    ...drops
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Card 
        title={<Title level={3}>Booking Navigation</Title>} 
        style={{ width: '100%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '12px' }}
      >
        <Text strong style={{ fontSize: '18px', marginBottom: '20px', display: 'block' }}>
          {isSharedBooking ? 'Shared Booking' : 'Single Booking'}
        </Text>
        
        {/* Map component */}
        <div style={{ height: '400px', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={userLocation || (allLocations[1] ? { lat: allLocations[1].lat, lng: allLocations[1].lng } : { lat: 0, lng: 0 })}
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
            {allLocations.map((location, index) => (
              <Marker
                key={index}
                position={{ lat: location.lat, lng: location.lng }}
                label={location.type === 'current' ? '' : `${index}`}
                icon={{
                  url: location.type === 'current' 
                    ? '../../../assets/icons/driver_icon.png'
                    : location.type === 'pickup' 
                      ? '../../../assets/icons/location_icon.png' 
                      : '../../../assets/icons/location_icon.png',
                  scaledSize: new window.google.maps.Size(location.type === 'current' ? 40 : 30, location.type === 'current' ? 40 : 30),
                }}
              />
            ))}
          </GoogleMap>
        </div>

        {/* Route list */}
        <List
          style={{ 
            marginTop: 16, 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px', 
            padding: '16px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
          header={<div>Current Location</div>}
        >
          <List.Item>
            <List.Item.Meta
              avatar={<EnvironmentOutlined style={{ color: 'blue' }} />}
              title="Current Location"
              description={currentLocationAddress || 'Fetching address...'}
            />
            <Button
              onClick={startRide}
              style={{...buttonStyle, fontSize: '16px', padding: '8px 16px'}}
              icon={<PlayCircleOutlined />}
              disabled={rideStarted}
            >
              {rideStarted ? 'Ride In Progress' : 'Start Ride'}
            </Button>
          </List.Item>
        </List>

        <Divider>Pickups</Divider>
        <List
          style={{ 
            marginTop: 16, 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px', 
            padding: '16px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
          dataSource={pickups}
          renderItem={(location, index) => renderLocationItem(location, index, true)}
        />

        <Divider>Drops</Divider>
        <List
          style={{ 
            marginTop: 16, 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px', 
            padding: '16px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
          dataSource={drops}
          renderItem={(location, index) => renderLocationItem(location, index, false)}
        />

        {/* Navigation buttons */}
        {rideStarted && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <Text style={{ width: '100%', textAlign: 'center', marginBottom: '10px', fontSize: '18px' }}>
              Current Step: {step + 1} of {allLocations.length - 1}
            </Text>
            <Button
              onClick={handleNavigate}
              style={{...buttonStyle}}
              disabled={!rideStarted}
            >
              Navigate
            </Button>
            <Button
              onClick={openInGoogleMaps}
              style={{...buttonStyle}}
              disabled={!rideStarted}
            >
              Open in Google Maps
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookingNavigation;