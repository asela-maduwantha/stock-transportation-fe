import React from 'react';
import { Button, Modal, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const BookingSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        pickupLocation,
        dropLocation,
        pickupDate,
        pickupTime,
        returnTrip,
        distance,
        charges,
        selectedVehicle,
        calculatedDropDateTime,
        shareSpace
    } = location.state || {};

    const handleBooking = async () => {
        try {
            
            const customerId = localStorage.getItem('customerId');
            const bookingData = {
                createdAt: new Date().toISOString(),
                bookingDate: pickupDate,
                pickupTime: pickupTime,
                handlingTime: distance * 60, 
                startLong: pickupLocation.lng,
                startLat: pickupLocation.lat,
                destLong: dropLocation.lng,
                destLat: dropLocation.lat,
                travellingTime: distance * 60, 
                vehicleCharge: charges.vehicleCharge,
                serviceCharge: charges.serviceCharge,
                loadingCapacity: selectedVehicle.capacity,
                isReturnTrip: returnTrip,
                willingToShare: shareSpace,
                status: 'upcoming',
                vehicleId: selectedVehicle.id,
                customerId: customerId
            };

            console.log(bookingData)
            const response = await httpService.post('/customer/booking', bookingData);

            if (response.data.bookingId) {
                localStorage.setItem('bookingId', response.data.bookingId); 
                message.success('Booking confirmed!');
               
                navigate('/payment', {
                    state: {
                        bookingId:localStorage.getItem('bookingId'),
                        vehicle: selectedVehicle,
                        pickupLocation: pickupLocation.address,
                        dropLocation: dropLocation.address,
                        returnTrip,
                        advanceAmount: charges.vehicleCharge, 
                        totalPrice: charges.total
                    }
                });
            } else {
                message.error('Failed to confirm booking.');
            }
        } catch (error) {
            console.error('Error booking:', error);
            message.error('Error confirming booking.');
        }
    };

    const handleBack = () => {
        navigate('/booking-details');
    };

    return (
        <Modal
            title="Booking Summary"
            visible={true}
            footer={null}
            onCancel={handleBack}
        >
            <p><strong>Pickup Location:</strong> {pickupLocation?.address}</p>
            <p><strong>Drop Location:</strong> {dropLocation?.address}</p>
            <p><strong>Pickup Date:</strong> {pickupDate}</p>
            <p><strong>Pickup Time:</strong> {pickupTime}</p>
            <p><strong>Return Trip:</strong> {returnTrip ? 'Yes' : 'No'}</p>
            <p><strong>Distance:</strong> {distance.toFixed(2)} km</p>
            <p><strong>Drop Date & Time:</strong> {calculatedDropDateTime?.date} {calculatedDropDateTime?.time}</p>
            <p><strong>Vehicle Charge:</strong> LKR {charges?.vehicleCharge.toFixed(2)}</p>
            <p><strong>Service Charge:</strong> LKR {charges?.serviceCharge.toFixed(2)}</p>
            <p><strong>Total Price:</strong> LKR {charges?.total.toFixed(2)}</p>
            <Button type="primary" block onClick={handleBooking}>
                Confirm Booking
            </Button>
            <Button style={{ marginTop: '10px' }} block onClick={handleBack}>
                Back to Details
            </Button>
        </Modal>
    );
};

export default BookingSummary;
