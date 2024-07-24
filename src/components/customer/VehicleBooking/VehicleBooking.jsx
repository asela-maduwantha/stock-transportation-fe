// src/components/VehicleBooking/VehicleBooking.jsx
import React, { useState } from 'react';
import { Layout, Typography, Button } from 'antd';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import VehicleSelection from '../VehicleSelection/VehicleSelection';
import BookingDetails from '../BookingDetails/BookingDetails';

const { Content } = Layout;
const { Title } = Typography;

const VehicleBooking = () => {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [bookingStep, setBookingStep] = useState(1);

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setBookingStep(2);
    };

    const handleGoBack = () => {
        setBookingStep(1);
    };

    // Google Maps setup
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyAyRG15a19j3uqI_7uEbQ6CZrp-h2KP0eM', 
        libraries: ['places'],
    });

    const center = { lat: -34.397, lng: 150.644 };
    const containerStyle = { width: '100%', height: '400px' };

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', width: '100%' }}>
            <Content style={{ padding: '24px' }}>
                <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>Vehicle Booking</Title>
                {bookingStep === 1 ? (
                    <VehicleSelection onVehicleSelect={handleVehicleSelect} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Button 
                            type="primary" 
                            onClick={handleGoBack} 
                            style={{ backgroundColor: '#FDB940', borderColor: '#FDB940', marginBottom: '16px' }}
                        >
                            Back to Vehicle Selection
                        </Button>
                        <BookingDetails selectedVehicle={selectedVehicle} />
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={center}
                                zoom={10}
                            >
                                <Marker position={center} />
                            </GoogleMap>
                        ) : (
                            <div>Loading...</div>
                        )}
                    </div>
                )}
            </Content>
        </Layout>
    );
};

export default VehicleBooking;
