import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Spin } from 'antd';
import httpService from '../../../services/httpService';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import GoogleMapsLoader from '../../../services/GoogleMapsLoader'; 

const containerStyle = {
  width: '100%',
  height: '400px',
};

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const ownerId = localStorage.getItem('ownerId');
        const response = await httpService.get(`/owner/myBookings/${ownerId}`);
        setBookings(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const geocodeLatLng = (geocoder, lat, lng) => {
    return new Promise((resolve, reject) => {
      const latlng = { lat, lng };
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve('Unknown');
          }
        } else {
          reject('Geocoder failed due to: ' + status);
        }
      });
    });
  };

  const handleViewMore = async (booking) => {
    setMapLoading(true);
    const geocoder = new window.google.maps.Geocoder();

    try {
      const startLocation = await geocodeLatLng(geocoder, booking.startLat, booking.startLong);
      const endLocation = await geocodeLatLng(geocoder, booking.destLat, booking.destLong);

      setSelectedBooking({
        ...booking,
        startLocation,
        endLocation,
      });
      setShowMap(true);
    } catch (error) {
      console.error('Error fetching location names:', error);
    } finally {
      setMapLoading(false);
    }
  };

  const handleCancel = () => {
    setShowMap(false);
    setSelectedBooking(null);
    setDirectionsResponse(null); // Clear directions
  };

  const renderMap = useCallback(() => {
    if (selectedBooking) {
      return (
        <GoogleMapsLoader>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: selectedBooking.startLat, lng: selectedBooking.startLong }}
            zoom={10}
          >
            <Marker position={{ lat: selectedBooking.startLat, lng: selectedBooking.startLong }} label="Start" />
            <Marker position={{ lat: selectedBooking.destLat, lng: selectedBooking.destLong }} label="End" />

            <DirectionsService
              options={{
                origin: { lat: selectedBooking.startLat, lng: selectedBooking.startLong },
                destination: { lat: selectedBooking.destLat, lng: selectedBooking.destLong },
                travelMode: 'DRIVING',
              }}
              callback={response => {
                if (response?.status === 'OK') {
                  setDirectionsResponse(response);
                } else {
                  console.error('Error fetching directions:', response);
                }
              }}
            />

            {directionsResponse && (
              <DirectionsRenderer
                directions={directionsResponse}
              />
            )}
          </GoogleMap>
        </GoogleMapsLoader>
      );
    }
    return null;
  }, [selectedBooking, directionsResponse]);

  const columns = [
    {
      title: 'No.',
      key: 'index',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Customer Name',
      dataIndex: 'customer',
      key: 'customer',
      render: customer => `${customer.firstName} ${customer.lastName}`,
    },
    {
      title: 'Booking Date',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: text => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Pickup Time',
      dataIndex: 'pickupTime',
      key: 'pickupTime',
    },
    {
      title: 'Contact Number',
      dataIndex: 'customer',
      key: 'contactNumber',
      render: customer => customer.mobileNum,
    },
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicleId',
      key: 'vehicleId',
      render: vehicleId => vehicleId,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleViewMore(record)}>View More</Button>
      ),
    },
  ];

  if (loading) return <Spin tip="Loading bookings..." size="large" />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ margin: '20px' }}>
      <Table
        dataSource={bookings}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Booking Details"
        visible={showMap}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        {selectedBooking && (
          <div>
            <p><strong>Customer Name:</strong> {`${selectedBooking.customer.firstName} ${selectedBooking.customer.lastName}`}</p>
            <p><strong>Booking Date:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
            <p><strong>Pickup Time:</strong> {selectedBooking.pickupTime}</p>
            <p><strong>Contact Number:</strong> {selectedBooking.customer.mobileNum}</p>
            <p><strong>Vehicle Number:</strong> {selectedBooking.vehicleId}</p>
            <p><strong>Handling Time:</strong> {`${Math.floor(selectedBooking.handlingTime / 60)}m ${Math.floor(selectedBooking.handlingTime % 60)}s`}</p>
            <p><strong>Vehicle Charge:</strong> LKR {selectedBooking.vehicleCharge.toLocaleString()}</p>
            <p><strong>Service Charge:</strong> LKR {selectedBooking.serviceCharge.toLocaleString()}</p>
            <p><strong>Loading Capacity:</strong> {selectedBooking.loadingCapacity} tons</p>
            <p><strong>Start Location:</strong> {selectedBooking.startLocation}</p>
            <p><strong>End Location:</strong> {selectedBooking.endLocation}</p>
            <Spin spinning={mapLoading} tip="Loading map..." size="large">
              {renderMap()}
            </Spin>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingsList;
