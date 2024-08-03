// src/components/VehicleBooking/VehicleBooking.jsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import VehicleSelection from '../VehicleSelection/VehicleSelection';
import BookingDetails from '../BookingDetails/BookingDetails';

const { Content } = Layout;


const VehicleBooking = () => {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [bookingStep, setBookingStep] = useState(1);

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setBookingStep(2);
    };

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', width: '100%' }}>
            <Content style={{ padding: '24px' }}>
                {bookingStep === 1 ? (
                    <VehicleSelection onVehicleSelect={handleVehicleSelect} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    
                        <BookingDetails selectedVehicle={selectedVehicle} />
                        
                    </div>
                )}
            </Content>
        </Layout>
    );
};

export default VehicleBooking;
