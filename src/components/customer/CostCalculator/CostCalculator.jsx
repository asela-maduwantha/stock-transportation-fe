import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Select, Switch, Button, Typography, Spin } from 'antd';
import { GoogleMap, Marker, Autocomplete, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import GoogleMapsLoader from '../../../services/GoogleMapsLoader';

const { Option } = Select;
const { Text } = Typography;

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 7.8731,
  lng: 80.7718
};

const cardStyle = {
  width: '100%',
  maxWidth: '600px',
  margin: '20px auto',
  padding: '20px',
  backgroundColor: '#f0f2f5',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
};

const labelStyle = {
  fontWeight: 'bold',
  marginBottom: '8px',
  display: 'block'
};

const totalCostStyle = {
  fontSize: '24px',
  color: '#1890ff',
  marginTop: '8px'
};

const rowStyle = {
  marginBottom: '16px'
};

const inputStyle = {
  width: '100%'
};

const CostCalculator = () => {
  const [vehicleType, setVehicleType] = useState('');
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [distance, setDistance] = useState(0);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickupRef = useRef();
  const dropRef = useRef();

  const vehiclePrices = {
    Sedan: 50,
    SUV: 70,
    Van: 100,
    Lorry: 120,
    Freezer: 150,
    Container: 200,
    'Tipper Truck': 180,
  };

  const calculateCost = () => {
    let totalCost = distance * vehiclePrices[vehicleType];
    if (isReturnTrip) {
      totalCost *= 1.5;
    }
    return totalCost.toFixed(2);
  };

  const onPlaceChanged = (ref, setLocation) => {
    const place = ref.current.getPlace();
    if (place.geometry) {
      setLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address
      });
    }
  };

  useEffect(() => {
    if (pickupLocation && dropLocation) {
      setLoading(true);
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [new window.google.maps.LatLng(pickupLocation.lat, pickupLocation.lng)],
          destinations: [new window.google.maps.LatLng(dropLocation.lat, dropLocation.lng)],
          travelMode: 'DRIVING',
        },
        (response, status) => {
          setLoading(false);
          if (status === 'OK') {
            setDistance(response.rows[0].elements[0].distance.value / 1000); // distance in km
          }
        }
      );
    }
  }, [pickupLocation, dropLocation]);

  return (
    <GoogleMapsLoader>
      <div style={{ padding: '20px' }}>
        <Card title="Trip Cost Calculator" style={cardStyle}>
          <Row gutter={[16, 16]} style={rowStyle}>
            <Col span={12}>
              <label style={labelStyle}>Select Vehicle Type:</label>
              <Select
                value={vehicleType}
                onChange={value => setVehicleType(value)}
                style={{ width: '100%' }}
              >
                {Object.keys(vehiclePrices).map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
              <Text>Price per km: LKR {vehiclePrices[vehicleType]}</Text>
            </Col>
            <Col span={12}>
              <label style={labelStyle}>Pickup Location:</label>
              <Autocomplete
                onLoad={ref => (pickupRef.current = ref)}
                onPlaceChanged={() => onPlaceChanged(pickupRef, setPickupLocation)}
              >
                <input type="text" placeholder="Enter pickup location" style={inputStyle} />
              </Autocomplete>
            </Col>
            <Col span={12}>
              <label style={labelStyle}>Drop Location:</label>
              <Autocomplete
                onLoad={ref => (dropRef.current = ref)}
                onPlaceChanged={() => onPlaceChanged(dropRef, setDropLocation)}
              >
                <input type="text" placeholder="Enter drop location" style={inputStyle} />
              </Autocomplete>
            </Col>
            <Col span={12}>
              <label style={labelStyle}>Return Trip:</label>
              <Switch
                checked={isReturnTrip}
                onChange={checked => setIsReturnTrip(checked)}
              />
            </Col>
            <Col span={24} style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button type="primary" size="large" onClick={calculateCost} disabled={loading}>
                {loading ? <Spin /> : 'Calculate Cost'}
              </Button>
            </Col>
            <Col span={24} style={{ textAlign: 'center', marginTop: '16px' }}>
              {distance > 0 && (
                <div>
                  <h3>Total Cost:</h3>
                  <p style={totalCostStyle}>{`LKR ${calculateCost()}`}</p>
                </div>
              )}
            </Col>
            <Col span={24}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={8}
              >
                {pickupLocation && <Marker position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }} />}
                {dropLocation && <Marker position={{ lat: dropLocation.lat, lng: dropLocation.lng }} />}
                {pickupLocation && dropLocation && (
                  <DirectionsService
                    options={{
                      origin: new window.google.maps.LatLng(pickupLocation.lat, pickupLocation.lng),
                      destination: new window.google.maps.LatLng(dropLocation.lat, dropLocation.lng),
                      travelMode: 'DRIVING'
                    }}
                    callback={(response) => {
                      if (response !== null) {
                        setDirectionsResponse(response);
                      }
                    }}
                  />
                )}
                {directionsResponse && (
                  <DirectionsRenderer
                    options={{
                      directions: directionsResponse
                    }}
                  />
                )}
              </GoogleMap>
            </Col>
          </Row>
        </Card>
      </div>
    </GoogleMapsLoader>
  );
};

export default CostCalculator;
