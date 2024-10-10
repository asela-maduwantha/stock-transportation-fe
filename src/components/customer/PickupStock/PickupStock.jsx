import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Card, message, Row, Col, Spin } from 'antd';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const PickupStock = () => {
  const [socket, setSocket] = useState(null);
  const [directions, setDirections] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [loadingTime, setLoadingTime] = useState('00:00:00');
  const [unloadingTime, setUnloadingTime] = useState('00:00:00');
  const [bookingId, setBookingId] = useState('');
  const [bookingType, setBookingType] = useState('original');
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyA4AnscOsaLsNUGrCnWrJH-k8XlBsltPgM',
    libraries: ['places'],
  });

  useEffect(() => {
    const storedBookingId = localStorage.getItem('bookingId');
    const storedBookingType = localStorage.getItem('bookingType');
    if (storedBookingId) {
      setBookingId(storedBookingId);
    }
    if (storedBookingType) {
      setBookingType(storedBookingType);
    }

    const newSocket = io('https://stocktrans.azurewebsites.net');
    setSocket(newSocket);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting customer's location:", error);
          message.error("Failed to get your location. Please enable location services.");
        }
      );
    } else {
      message.error("Your browser doesn't support geolocation.");
    }

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && bookingId) {
      socket.emit('joinRideRoom', bookingId);

      socket.on('timerUpdate', (data) => {
        if (data.loadingTime) setLoadingTime(data.loadingTime);
        if (data.unloadingTime) setUnloadingTime(data.unloadingTime);
      });

      socket.on('coordinates', (data) => {
        setDriverLocation({ lat: data.latitude, lng: data.longitude });
      });

      socket.on('unloadingComplete', () => {
        navigate('/customer/pay-balance', {
          state: { bookingId, bookingType }
        });
      });

      return () => {
        socket.off('timerUpdate');
        socket.off('coordinates');
        socket.off('unloadingComplete');
      };
    }
  }, [socket, bookingId, bookingType, navigate]);

  useEffect(() => {
    if (isLoaded && driverLocation && customerLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(driverLocation.lat, driverLocation.lng),
          destination: new window.google.maps.LatLng(customerLocation.lat, customerLocation.lng),
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
    }
  }, [isLoaded, driverLocation, customerLocation]);

  const renderMap = () => {
    if (!isLoaded) return <Spin size="large" />;

    return (
      <div style={{ width: '100%', height: '400px' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={customerLocation || driverLocation || { lat: 0, lng: 0 }}
          zoom={15}
        >
          {driverLocation && <Marker position={driverLocation} label="Driver" />}
          {customerLocation && <Marker position={customerLocation} label="You" />}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
    );
  };

  return (
    <Card title="Driver Navigation">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {renderMap()}
        </Col>
        <Col span={12}>
          <Card size="small" title="Loading Time">
            <Spin spinning={loadingTime === '00:00:00'}>
              {loadingTime}
            </Spin>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="Unloading Time">
            <Spin spinning={unloadingTime === '00:00:00'}>
              {unloadingTime}
            </Spin>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default PickupStock;