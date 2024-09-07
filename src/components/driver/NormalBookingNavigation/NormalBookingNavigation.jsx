import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, List, Button, Typography, message, Spin, Modal } from 'antd';
import { EnvironmentOutlined, CarOutlined, CompassOutlined } from '@ant-design/icons';
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const { Title, Text } = Typography;

const NormalBookingNavigation = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [step, setStep] = useState('pickup'); // 'pickup' or 'dropoff'

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your actual API key
    libraries: ['places'],
  });

  useEffect(() => {
    if (isLoaded) {
      requestLocationAccess();
    }
  }, [isLoaded]);

  const requestLocationAccess = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          message.error("Unable to access your location. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
      message.error("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    if (userLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      const destination = step === 'pickup' 
        ? new window.google.maps.LatLng(location.state.startLat, location.state.startLong)
        : new window.google.maps.LatLng(location.state.destLat, location.state.destLong);

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
            console.error(`error fetching directions ${result}`);
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
    if (step === 'pickup') {
      setStep('dropoff');
      setDirections(null);
    } else {
      message.success('Trip completed!');
    }
  };

  const openInGoogleMaps = () => {
    const destination = step === 'pickup'
      ? `${location.state.startLat},${location.state.startLong}`
      : `${location.state.destLat},${location.state.destLong}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  if (loading || !isLoaded) {
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
            avatar={step === 'pickup' ? <CarOutlined /> : <EnvironmentOutlined />}
            title={step === 'pickup' ? 'Pickup Location' : 'Dropoff Location'}
            description={step === 'pickup' ? 'Navigate to pickup the passenger' : 'Navigate to drop off the passenger'}
          />
          <Button type="primary" onClick={handleNavigate} style={{ marginRight: 8 }}>
            Navigate
          </Button>
          <Button onClick={openInGoogleMaps}>
            Open in Google Maps
          </Button>
        </List.Item>
      </List>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text>Current Step: {step === 'pickup' ? 'Pickup' : 'Dropoff'}</Text>
        <Button 
          type="primary" 
          onClick={handleNextStep} 
          style={{ marginLeft: 10 }}
          icon={<CompassOutlined />}
        >
          {step === 'pickup' ? 'Proceed to Dropoff' : 'Complete Trip'}
        </Button>
      </div>
    </Card>
  );
};

export default NormalBookingNavigation;