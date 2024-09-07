import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, List, Button, Typography, message, Spin, Modal} from 'antd';
import { EnvironmentOutlined, CarOutlined } from '@ant-design/icons';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

const { Title, Text } = Typography;

const SharedBookingNavigations = () => {
  const location = useLocation();
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  }, []);

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  useEffect(() => {
    const { startLat, startLong, destLat, destLong, orgStartLat, orgStartLong, orgDestLat, orgDestLong } = location.state;

    // Calculate distances to determine the order of operations
    const distanceToFirstDest = calculateDistance(orgStartLat, orgStartLong, destLat, destLong);
    const distanceToSecondDest = calculateDistance(orgStartLat, orgStartLong, orgDestLat, orgDestLong);

    let orderedSteps;
    if (distanceToFirstDest > distanceToSecondDest) {
      orderedSteps = [
        { type: 'pickup', lat: startLat, long: startLong, description: 'Pick up first stock' },
        { type: 'pickup', lat: orgStartLat, long: orgStartLong, description: 'Pick up second stock' },
        { type: 'dropoff', lat: orgDestLat, long: orgDestLong, description: 'Drop off second stock' },
        { type: 'dropoff', lat: destLat, long: destLong, description: 'Drop off first stock' },
      ];
    } else {
      orderedSteps = [
        { type: 'pickup', lat: orgStartLat, long: orgStartLong, description: 'Pick up first stock' },
        { type: 'pickup', lat: startLat, long: startLong, description: 'Pick up second stock' },
        { type: 'dropoff', lat: destLat, long: destLong, description: 'Drop off second stock' },
        { type: 'dropoff', lat: orgDestLat, long: orgDestLong, description: 'Drop off first stock' },
      ];
    }

    setSteps(orderedSteps);
    setLoading(false);
  }, [location.state, calculateDistance]);

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
    if (currentStep < steps.length && userLocation) {
      const { lat, long } = steps[currentStep];
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
          destination: new window.google.maps.LatLng(lat, long),
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setDirections(null); // Clear directions for the new step
    } else {
      message.success('All steps completed!');
    }
  };

  const openInGoogleMaps = () => {
    if (currentStep < steps.length) {
      const { lat, long } = steps[currentStep];
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <Text style={{ marginLeft: 10 }}>Loading navigation details...</Text>
      </div>
    );
  }

  return (
    <Card title={<Title level={3}>Shared Booking Navigation</Title>} style={{ width: '100%', maxWidth: 800, margin: '20px auto' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={userLocation || { lat: 0, lng: 0 }}
        zoom={10}
      >
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      <List
        style={{ marginTop: 16 }}
        dataSource={steps}
        renderItem={(step, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={step.type === 'pickup' ? <CarOutlined /> : <EnvironmentOutlined />}
              title={`Step ${index + 1}`}
              description={step.description}
            />
            {index === currentStep && (
              <>
                <Button type="primary" onClick={handleNavigate} style={{ marginRight: 8 }}>
                  Navigate
                </Button>
                <Button onClick={openInGoogleMaps}>
                  Open in Google Maps
                </Button>
              </>
            )}
          </List.Item>
        )}
      />

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text>Current Step: {currentStep + 1}</Text>
        <Button 
          type="primary" 
          onClick={handleNextStep} 
          style={{ marginLeft: 10 }}
          disabled={currentStep >= steps.length - 1}
        >
          Next Step
        </Button>
      </div>
    </Card>
  );
};

export default SharedBookingNavigations;