import React, { useEffect, useState } from 'react';
import { Card, Avatar, Row, Col, Spin } from 'antd';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
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

  // Use the useJsApiLoader hook
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey, 
    libraries: ['places'],
  });

  return (
    <Spin spinning={!isLoaded} tip="Loading map...">
      <div className="customer-view-container">
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} md={12}>
            <Card title="Driver Details" className="driver-card">
              <div className="driver-details" style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar size={64} src={driverData.photo} />
                <div className="driver-info" style={{ marginLeft: '16px' }}>
                  <h3>{driverData.name}</h3>
                  <p>Vehicle: {driverData.vehicle}</p>
                  <p>Mobile: {driverData.mobile}</p>
                </div>
              </div>
              <div className="pickup-details" style={{ marginTop: '16px' }}>
                <p>Current Date and Time: {currentTime}</p>
                <p>Pickup Location: {customerData.address}</p>
              </div>
              {isLoaded && (
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
              )}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p>OTP: {driverData.otp}</p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default CustomerView;
