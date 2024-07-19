import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Avatar, message, Modal, Input } from 'antd';
import { LoadScript, GoogleMap, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import moment from 'moment';

const apiKey = 'AIzaSyAyRG15a19j3uqI_7uEbQ6CZrp-h2KP0eM';

const customerData = {
  name: 'John Doe',
  photo: 'https://via.placeholder.com/150',
  address: '123 Main St, Colombo, Sri Lanka',
  pickupLocation: { lat: 6.9271, lng: 79.8612 },
};

const PickupStock = () => {
  const [currentTime, setCurrentTime] = useState(moment().format('MMMM Do YYYY, h:mm:ss a'));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format('MMMM Do YYYY, h:mm:ss a'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          message.error('Unable to retrieve your location.');
          console.error(error);
        }
      );
    } else {
      message.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleDirectionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirectionsResponse(response);
      } else {
        console.error('response: ', response);
      }
    }
  };

  const handlePickupConfirm = () => {
    setIsOtpModalVisible(true);
  };

  const handleOtpSubmit = () => {
    if (otp === '1234') {  // Replace with actual OTP verification logic
      setPickupConfirmed(true);
      setIsOtpModalVisible(false);
      message.success('Pickup confirmed!');
    } else {
      message.error('Invalid OTP. Please try again.');
    }
  };

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${driverLocation.lat},${driverLocation.lng}&destination=${customerData.pickupLocation.lat},${customerData.pickupLocation.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="pickup-stock-container">
      <Card
        title="Pickup Stock from Customer"
        className="pickup-card"
      >
        <div className="customer-details">
          <Avatar size={64} src={customerData.photo} />
          <div className="customer-info">
            <h3>{customerData.name}</h3>
            <p>{customerData.address}</p>
          </div>
        </div>
        <div className="pickup-details">
          <p>Current Date and Time: {currentTime}</p>
          <p>Pickup Time: {moment().add(30, 'minutes').format('MMMM Do YYYY, h:mm a')}</p>
        </div>
        {driverLocation && (
          <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
              id="direction-map"
              mapContainerStyle={{ height: '400px', width: '100%' }}
              zoom={14}
              center={driverLocation}
              options={{ gestureHandling: 'greedy' }}
            >
              <Marker
                position={driverLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                }}
                label="You"
              />
              <Marker
                position={customerData.pickupLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                }}
                label="Customer"
              />
              <DirectionsService
                options={{
                  destination: customerData.pickupLocation,
                  origin: driverLocation,
                  travelMode: 'DRIVING',
                }}
                callback={handleDirectionsCallback}
              />
              {directionsResponse && (
                <DirectionsRenderer
                  options={{
                    directions: directionsResponse,
                    polylineOptions: {
                      strokeColor: '#ff2527',
                      strokeOpacity: 0.8,
                      strokeWeight: 5,
                    },
                    markerOptions: {
                      visible: true,
                      icon: {
                        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                      },
                    },
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        )}
        {directionsResponse && (
          <Form.Item style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              type="primary"
              onClick={handlePickupConfirm}
              style={{ backgroundColor: '#fdb940', borderColor: '#fdb940', marginRight: '10px' }}
            >
              Pickup Confirm
            </Button>
            <Button
              type="default"
              onClick={handleOpenGoogleMaps}
            >
              Open in Google Maps
            </Button>
          </Form.Item>
        )}
        {pickupConfirmed && <p style={{ textAlign: 'center', color: 'green' }}>Pickup has been confirmed!</p>}
      </Card>
      <Modal
        title="Enter OTP"
        visible={isOtpModalVisible}
        onOk={handleOtpSubmit}
        onCancel={() => setIsOtpModalVisible(false)}
      >
        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </Modal>
     
    </div>
  );
};

export default PickupStock;
