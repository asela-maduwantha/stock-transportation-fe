import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card, Button, Row, Col, Spin, message, Typography, Space } from 'antd';
import { CarOutlined, UserOutlined, HomeOutlined, EnvironmentOutlined, CalendarOutlined, ClockCircleOutlined, DashboardOutlined, DollarOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Text, Title } = Typography;

const TripCard = ({ trip, onBooking }) => (
  <Card
    hoverable
    style={{ marginBottom: 16 }}
    cover={
      <img
        alt={`${trip.vehicle?.type || 'Vehicle'} - ${trip.vehicle?.regNo || 'Unknown'}`}
        src={trip.vehicle?.photoUrl || "/api/placeholder/400/200"}
        style={{ height: 200, objectFit: 'cover' }}
      />
    }
  >
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Title level={4}>{trip.vehicle?.type || 'Unknown'} - {trip.vehicle?.regNo || 'Unknown'}</Title>
      <Text><CalendarOutlined /> {new Date(trip.bookingDate).toLocaleDateString()}</Text>
      <Text><EnvironmentOutlined /> From: {trip.startAddress}</Text>
      <Text><EnvironmentOutlined /> To: {trip.destAddress}</Text>
      <Text><ClockCircleOutlined /> Pickup Time: {trip.pickupTime}</Text>
      <Text><DashboardOutlined /> Distance: {trip.distance}</Text>
      <Text><ClockCircleOutlined /> Estimated Time: {trip.duration}</Text>
      
      <Card size="small" title={<><CarOutlined /> Vehicle Details</>}>
        <Text>Capacity: {trip.vehicle?.capacity || 'N/A'} {trip.vehicle?.capacityUnit || ''}</Text>
        <br />
        <Text>Charge per km: LKR {trip.vehicle?.chargePerKm || 'N/A'}</Text>
        <br />
        <Text>{trip.vehicle?.heavyVehicle ? 'Heavy Vehicle' : 'Light Vehicle'}</Text>
      </Card>
      
      <Card size="small" title={<><UserOutlined /> Driver</>}>
        <Text>{trip.driver?.firstName || 'N/A'} {trip.driver?.lastName || ''}</Text>
        <br />
        <Text>{trip.driver?.mobNumber || 'N/A'}</Text>
      </Card>
      
      <Card size="small" title={<><HomeOutlined /> Owner</>}>
        <Text>{trip.owner?.firstName || 'N/A'} {trip.owner?.lastName || ''}</Text>
        <br />
        <Text>{trip.owner?.mobNumber || 'N/A'}</Text>
      </Card>
      
      <Card size="small" title={<><DollarOutlined /> Charges</>}>
        <Text>Vehicle Charge: LKR {trip.charges?.vehicleCharge || 'N/A'}</Text>
        <br />
        <Text>Service Charge: LKR {trip.charges?.serviceCharge || 'N/A'}</Text>
        <br />
        <Text>Total: LKR {trip.charges?.total || 'N/A'}</Text>
        <br />
        <Text>Advance Payment: LKR {trip.charges?.advancePayment || 'N/A'}</Text>
      </Card>
      
      <Button type="primary" block onClick={() => onBooking(trip)} style={{ backgroundColor: '#fdb940', borderColor: '#fdb940' }}>
        Make Booking
      </Button>
    </Space>
  </Card>
);

TripCard.propTypes = {
  trip: PropTypes.shape({
    id: PropTypes.string.isRequired,
    bookingDate: PropTypes.string.isRequired,
    startAddress: PropTypes.string.isRequired,
    destAddress: PropTypes.string.isRequired,
    startLat: PropTypes.number.isRequired,
    startLong: PropTypes.number.isRequired,
    destLat: PropTypes.number.isRequired,
    destLong: PropTypes.number.isRequired,
    distance: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    pickupTime: PropTypes.string.isRequired,
    vehicle: PropTypes.shape({
      type: PropTypes.string,
      regNo: PropTypes.string,
      photoUrl: PropTypes.string,
      capacity: PropTypes.number,
      capacityUnit: PropTypes.string,
      chargePerKm: PropTypes.number,
      heavyVehicle: PropTypes.bool
    }),
    driver: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      mobNumber: PropTypes.string
    }),
    owner: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      mobNumber: PropTypes.string
    }),
    charges: PropTypes.shape({
      vehicleCharge: PropTypes.number,
      serviceCharge: PropTypes.number,
      total: PropTypes.number,
      advancePayment: PropTypes.number
    })
  }).isRequired,
  onBooking: PropTypes.func.isRequired
};

const AvailableReturnTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAddress = useCallback(async (lat, lng) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: lat, lng: lng };
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve("Address not found");
          }
        } else {
          reject("Geocoder failed due to: " + status);
        }
      });
    });
  }, []);

  const fetchDistanceAndDuration = useCallback((originLat, originLng, destLat, destLng) => {
    return new Promise((resolve, reject) => {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [{ lat: originLat, lng: originLng }],
          destinations: [{ lat: destLat, lng: destLng }],
          travelMode: 'DRIVING',
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
            resolve({
              distance: response.rows[0].elements[0].distance.text,
              duration: response.rows[0].elements[0].duration.text
            });
          } else {
            reject('Error calculating distance');
          }
        }
      );
    });
  }, []);

  const fetchVehicleData = useCallback(async (id) => {
    try {
      const response = await httpService.get(`/common/vehicle/${id}?type=original`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      return null;
    }
  }, []);

  const fetchDriverData = useCallback(async (id) => {
    try {
      const response = await httpService.get(`/common/upcomingDriver/${id}?type=original`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver data:', error);
      return null;
    }
  }, []);

  const fetchOwnerData = useCallback(async (id) => {
    try {
      const response = await httpService.get(`/common/owner/${id}?type=original`);
      return response.data;
    } catch (error) {
      console.error('Error fetching owner data:', error);
      return null;
    }
  }, []);

  const fetchCharges = useCallback(async (vehicleId, distance) => {
    try {
      const response = await httpService.post('/customer/calCharge', {
        vehicleId,
        distance: parseFloat(distance),
        returnTrip: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching charges:', error);
      return null;
    }
  }, []);

  const fetchTripDetails = useCallback(async (trip) => {
    try {
      const [vehicle, driver, owner, startAddress, destAddress, distanceAndDuration] = await Promise.all([
        fetchVehicleData(trip.id),
        fetchDriverData(trip.id),
        fetchOwnerData(trip.id),
        fetchAddress(trip.startLat, trip.startLong),
        fetchAddress(trip.destLat, trip.destLong),
        fetchDistanceAndDuration(trip.startLat, trip.startLong, trip.destLat, trip.destLong)
      ]);

      const charges = await fetchCharges(vehicle.id, distanceAndDuration.distance.replace(/[^0-9.]/g, ''));

      return { 
        ...trip, 
        vehicle, 
        driver, 
        owner, 
        startAddress, 
        destAddress,
        distance: distanceAndDuration.distance,
        duration: distanceAndDuration.duration,
        charges
      };
    } catch (error) {
      console.error('Error fetching trip details:', error);
      return trip;
    }
  }, [fetchVehicleData, fetchDriverData, fetchOwnerData, fetchAddress, fetchDistanceAndDuration, fetchCharges]);

  useEffect(() => {
    const fetchReturnTrips = async () => {
      try {
        const response = await httpService.get('/customer/returnTrips');
        const tripsWithDetails = await Promise.all(response.data.map(fetchTripDetails));
        setTrips(tripsWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching return trips:', error);
        message.error('Failed to fetch return trips');
        setLoading(false);
      }
    };

    fetchReturnTrips();
  }, [fetchTripDetails]);

  const handleBooking = (trip) => {
    const bookingData = {
      vehicleData: trip.vehicle,
      startCoordinates: { lat: trip.startLat, lng: trip.startLong },
      destCoordinates: { lat: trip.destLat, lng: trip.destLong },
      distance: trip.distance,
      duration: trip.duration,
      charges: trip.charges,
      pickupTime: trip.pickupTime
    };
    navigate('/customer/make-return-book', { state: bookingData });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title style={{ color: '', marginBottom: 24 }}>Available Return Trips</Title>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={[16, 16]}>
          {trips.map(trip => (
            <Col xs={24} sm={12} md={8} lg={6} key={trip.id}>
              <TripCard trip={trip} onBooking={handleBooking} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AvailableReturnTrips;