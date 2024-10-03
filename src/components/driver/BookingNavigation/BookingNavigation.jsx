import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, List, Button, Typography, message, Spin, Modal } from 'antd';
import { EnvironmentOutlined, CompassOutlined } from '@ant-design/icons';
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import httpService from '../../../services/httpService';

const { Title, Text } = Typography;

const BookingNavigation = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [step, setStep] = useState('first'); // 'first', 'second', 'third', or 'fourth'
  const [coordinates, setCoordinates] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
  
    backgroundColor: isHovered ? '#fdb940' : '#fdb940',
    color: '#fff',
    fontWeight: 'normal',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, opacity 0.3s ease',
    opacity: isHovered ? '0.8' : '1',
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyA4AnscOsaLsNUGrCnWrJH-k8XlBsltPgM",
    libraries: ['places'],
  });

  const fetchCoordinates = useCallback(async () => {
    try {
      const response = await httpService.get(`driver/getCoordinates/${location.state.originalBookingId}`, {
        params: { bookingType: location.state.bookingType }
      });
      setCoordinates(response.data);
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

  const handleNavigate = () => {
    if (userLocation && coordinates) {
      const directionsService = new window.google.maps.DirectionsService();
      let destination;

      switch (step) {
        case 'first':
          destination = new window.google.maps.LatLng(coordinates.firstLat, coordinates.firstLong);
          break;
        case 'second':
          destination = new window.google.maps.LatLng(coordinates.secondLat, coordinates.secondLong);
          break;
        case 'third':
          destination = new window.google.maps.LatLng(coordinates.thirdLat, coordinates.thirdLong);
          break;
        case 'fourth':
          destination = new window.google.maps.LatLng(coordinates.fourthLat, coordinates.fourthLong);
          break;
        default:
          message.error("Invalid step");
          return;
      }

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
  };

  const handleNextStep = () => {
    switch (step) {
      case 'first':
        setStep('second');
        break;
      case 'second':
        if (location.state.bookingType === 'shared') {
          setStep('third');
        } else {
          message.success('Trip completed!');
        }
        break;
      case 'third':
        setStep('fourth');
        break;
      case 'fourth':
        message.success('Trip completed!');
        break;
      default:
        message.error('Invalid step');
    }
    setDirections(null);
  };

  const openInGoogleMaps = () => {
    let destination;
    switch (step) {
      case 'first':
        destination = `${coordinates.firstLat},${coordinates.firstLong}`;
        break;
      case 'second':
        destination = `${coordinates.secondLat},${coordinates.secondLong}`;
        break;
      case 'third':
        destination = `${coordinates.thirdLat},${coordinates.thirdLong}`;
        break;
      case 'fourth':
        destination = `${coordinates.fourthLat},${coordinates.fourthLong}`;
        break;
      default:
        message.error("Invalid step");
        return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  if (loading || !isLoaded || !coordinates) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <Text style={{ marginLeft: 10 }}>Loading navigation details...</Text>
      </div>
    );
  }

  return (
    <Card title={<Title level={3}>Booking Navigation</Title>} style={{ width: '100%', maxWidth: 800, margin: '20px auto' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={userLocation || { lat: 0, lng: 0 }}
        zoom={10}
      >
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      <List style={{ marginTop: 16 }}>
        <List.Item>
          <List.Item.Meta
            avatar={<EnvironmentOutlined />}
            title={`Location ${step.charAt(0).toUpperCase() + step.slice(1)}`}
            description={`Navigate to ${step} location`}
          />
          <Button
            type="primary"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleNavigate}
            style={{ ...buttonStyle, marginRight: 8 }}
          >
            Navigate
          </Button>
          <Button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={openInGoogleMaps}
            style={buttonStyle}
          >
            Open in Google Maps
          </Button>
        </List.Item>
      </List>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text>Current Step: {step.charAt(0).toUpperCase() + step.slice(1)}</Text>
        <Button
          type="primary"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleNextStep}
          style={{ ...buttonStyle, marginLeft: 10 }}
          icon={<CompassOutlined />}
        >
          {step === 'fourth' || (step === 'second' && location.state.bookingType !== 'shared') ? 'Complete Trip' : 'Next Location'}
        </Button>
      </div>
    </Card>
  );
};

export default BookingNavigation;
