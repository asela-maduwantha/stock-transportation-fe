import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Select, Switch, Button } from 'antd';
import { LoadScript, GoogleMap, Marker, Autocomplete, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import './CostCalculator.css';

const { Option } = Select;

const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 7.8731,
  lng: 80.7718
};

const CostCalculator = () => {
  const [vehicleType, setVehicleType] = useState('');
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [distance, setDistance] = useState(0);
  const [directionsResponse, setDirectionsResponse] = useState(null);

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
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [new window.google.maps.LatLng(pickupLocation.lat, pickupLocation.lng)],
          destinations: [new window.google.maps.LatLng(dropLocation.lat, dropLocation.lng)],
          travelMode: 'DRIVING',
        },
        (response, status) => {
          if (status === 'OK') {
            setDistance(response.rows[0].elements[0].distance.value / 1000); // distance in km
          }
        }
      );
    }
  }, [pickupLocation, dropLocation]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyAyRG15a19j3uqI_7uEbQ6CZrp-h2KP0eM" libraries={libraries}>
      <div className="trip-cost-calculator">
        <Card title="Trip Cost Calculator" className="calculator-card">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <label>Select Vehicle Type:</label>
              <Select
                value={vehicleType}
                onChange={value => setVehicleType(value)}
                style={{ width: '100%' }}
              >
                {Object.keys(vehiclePrices).map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
              <p>Price per km: LKR {vehiclePrices[vehicleType]}</p>
            </Col>
            <Col span={12}>
              <label>Pickup Location:</label>
              <Autocomplete
                onLoad={ref => (pickupRef.current = ref)}
                onPlaceChanged={() => onPlaceChanged(pickupRef, setPickupLocation)}
              >
                <input type="text" placeholder="Enter pickup location" style={{ width: '100%' }} />
              </Autocomplete>
            </Col>
            <Col span={12}>
              <label>Drop Location:</label>
              <Autocomplete
                onLoad={ref => (dropRef.current = ref)}
                onPlaceChanged={() => onPlaceChanged(dropRef, setDropLocation)}
              >
                <input type="text" placeholder="Enter drop location" style={{ width: '100%' }} />
              </Autocomplete>
            </Col>
            <Col span={12}>
              <label>Return Trip:</label>
              <Switch
                checked={isReturnTrip}
                onChange={checked => setIsReturnTrip(checked)}
              />
            </Col>
            <Col span={24} style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button type="primary" size="large" onClick={calculateCost}>Calculate Cost</Button>
            </Col>
            <Col span={24} style={{ textAlign: 'center', marginTop: '16px' }}>
              {distance > 0 && (
                <div>
                  <h3>Total Cost:</h3>
                  <p className="total-cost">{`LKR ${calculateCost()}`}</p>
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
    </LoadScript>
  );
};

export default CostCalculator;
