import React, { useEffect, useState } from 'react';
import { Card, Avatar } from 'antd';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import moment from 'moment';

const apiKey = 'AIzaSyAyRG15a19j3uqI_7uEbQ6CZrp-h2KP0eM';

const driverData = {
  name: 'Jane Smith',
  photo: 'https://via.placeholder.com/150',
  vehicle: 'Toyota Prius - AB1234',
  mobile: '+94 712345678',
  otp: '1234', 
};

const customerData = {
  name: 'John Doe',
  photo: 'https://via.placeholder.com/150',
  address: '123 Main St, Colombo, Sri Lanka',
  pickupLocation: { lat: 6.9271, lng: 79.8612 },
};

const initialDriverLocation = { lat: 6.9271, lng: 79.8612 };

const mapContainerStyle = {
  height: '400px',
  width: '100%',
};

const CustomerView = () => {
  const [currentTime, setCurrentTime] = useState(moment().format('MMMM Do YYYY, h:mm:ss a'));
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format('MMMM Do YYYY, h:mm:ss a'));
    }, 1000);

 
    const locationUpdate = setInterval(() => {
      setDriverLocation(prevLocation => ({
        lat: prevLocation.lat + 0.0001,
        lng: prevLocation.lng + 0.0001,
      }));
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(locationUpdate);
    };
  }, []);

  return (
    <div className="customer-view-container">
      <Card
        title="Driver Details"
        className="driver-card"
      >
        <div className="driver-details">
          <Avatar size={64} src={driverData.photo} />
          <div className="driver-info">
            <h3>{driverData.name}</h3>
            <p>Vehicle: {driverData.vehicle}</p>
            <p>Mobile: {driverData.mobile}</p>
          </div>
        </div>
        <div className="pickup-details">
          <p>Current Date and Time: {currentTime}</p>
          <p>Pickup Location: {customerData.address}</p>
        </div>
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            id="driver-movement-map"
            mapContainerStyle={mapContainerStyle}
            zoom={14}
            center={{
              lat: (driverLocation.lat + customerData.pickupLocation.lat) / 2,
              lng: (driverLocation.lng + customerData.pickupLocation.lng) / 2,
            }}
            options={{ gestureHandling: 'greedy' }}
          >
            <Marker
              position={driverLocation}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
              label={{
                text: 'Driver',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            />
            <Marker
              position={customerData.pickupLocation}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              }}
              label={{
                text: 'Stock',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            />
          </GoogleMap>
        </LoadScript>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>OTP: {driverData.otp}</p>
        </div>
      </Card>
    </div>
  );
};

export default CustomerView;
