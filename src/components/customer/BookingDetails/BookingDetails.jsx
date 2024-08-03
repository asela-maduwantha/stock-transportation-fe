import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Input, Button, Checkbox, DatePicker, TimePicker, Select, Modal, message, Row, Col } from 'antd';
import { GoogleMap, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const { Option } = Select;

const BookingDetails = ({ selectedVehicle }) => {
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);
    const [returnTrip, setReturnTrip] = useState(false);
    const [distance, setDistance] = useState(0);
    const [directions, setDirections] = useState(null);
    const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
    const [dropAutocomplete, setDropAutocomplete] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [capacity, setCapacity] = useState(1);
    const [shareSpace, setShareSpace] = useState(false);
    const [pickupDate, setPickupDate] = useState(null);
    const [pickupTime, setPickupTime] = useState(null);
    const [calculatedDropDateTime, setCalculatedDropDateTime] = useState(null);
    const [charge, setCharge] = useState({ vehicleCharge: 0, serviceCharge: 0, total: 0 });


    const navigate = useNavigate();



    const fetchCharges = async () => {
        console.log(selectedVehicle.id)
        try {
            const response = await httpService.get(`/customer/calCharge/${selectedVehicle.id}`, {
                params: { distance }
            });
            if (response.data) {
                setCharge(response.data)
            }
        } catch (error) {
            console.error('Error fetching charges:', error);
            message.error('Failed to fetch charge details.');
        }
    };
    
    const onPickupLoad = (autocomplete) => {
        setPickupAutocomplete(autocomplete);
    };

    const onDropLoad = (autocomplete) => {
        setDropAutocomplete(autocomplete);
    };

    const onPickupPlaceChanged = () => {
        if (pickupAutocomplete !== null) {
            const place = pickupAutocomplete.getPlace();
            setPickupLocation({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address,
            });
            document.getElementById('pickup-input').value = place.formatted_address;
        }
    };

    const onDropPlaceChanged = () => {
        if (dropAutocomplete !== null) {
            const place = dropAutocomplete.getPlace();
            setDropLocation({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address,
            });
            document.getElementById('drop-input').value = place.formatted_address;
        }
    };
    const showConfirmationModal = () => {
        if (pickupLocation && dropLocation && pickupDate && pickupTime) {
            fetchCharges(); // Fetch charges when showing the modal
            setIsModalVisible(true);
        } else {
            message.error('Please select all booking details.');
        }
    };
    

    const handleOk = async () => {
        setIsModalVisible(false);
        try {
            const bookingData = {
                bookingDate: new Date().toISOString(), 
                pickupTime: pickupTime,
                handlingTime: 0, 
                startLong: pickupLocation?.lng || 0,
                startLat: pickupLocation?.lat || 0,
                destLong: dropLocation?.lng || 0,
                destLat: dropLocation?.lat || 0,
                travellingTime: distance * 60 * 60, 
                vehicleCharge: charge.vehicleCharge,
                serviceCharge: charge.serviceCharge,
                loadingCapacity: shareSpace,
                isReturnTrip: returnTrip,
                willingToShare: shareSpace,
                vehicleId: selectedVehicle.id,
                customerId: localStorage.getItem('customerId')
            };
    
            const response = await httpService.post('/api/bookings', bookingData);
    
            if (response.data.success) {
                navigate('/payment', {
                    state: {
                        bookingId: response.data.bookingId,
                        vehicle: selectedVehicle,
                        pickupLocation,
                        dropLocation,
                        pickupDate,
                        pickupTime,
                        dropDate: calculatedDropDateTime?.date,
                        dropTime: calculatedDropDateTime?.time,
                        returnTrip,
                        distance,
                        advanceAmount: charge.total * 0.2,
                        totalPrice: charge.total,
                    },
                });
            } else {
                message.error('Booking failed. Please try again.');
            }
        } catch (error) {
            console.error('Booking error:', error);
            message.error('An error occurred while booking. Please try again.');
        }
    };
    
    
    

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        if (pickupLocation && dropLocation && pickupDate && pickupTime) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: new window.google.maps.LatLng(pickupLocation.lat, pickupLocation.lng),
                    destination: new window.google.maps.LatLng(dropLocation.lat, dropLocation.lng),
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                        setDistance(result.routes[0].legs[0].distance.value / 1000);
                        const travelDuration = result.routes[0].legs[0].duration.value; 
                        const pickupDateTime = moment(`${pickupDate} ${pickupTime}`);
                        const dropDateTime = pickupDateTime.clone().add(travelDuration, 'seconds');
                        setCalculatedDropDateTime({
                            date: dropDateTime.format('YYYY-MM-DD'),
                            time: dropDateTime.format('HH:mm'),
                        });
                    }
                }
            );
        }
    }, [pickupLocation, dropLocation, pickupDate, pickupTime]);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card
                        cover={<img alt={selectedVehicle.type} src={selectedVehicle.photoUrl} style={{ objectFit: 'cover', height: 200 }} />}
                    >
                        <Card.Meta
                            title={selectedVehicle.type}
                            description={
                                <>
                                    <p><strong>Type:</strong> {selectedVehicle.type}</p>
                                    <p><strong>Preferred Area:</strong> {selectedVehicle.preferredArea}</p>
                                    <p><strong>Capacity:</strong> {selectedVehicle.capacity} {selectedVehicle.capacityUnit}</p>
                                    <p><strong>Charge Per Km:</strong> LKR{selectedVehicle.chargePerKm}</p>
                                </>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Autocomplete onLoad={onPickupLoad} onPlaceChanged={onPickupPlaceChanged}>
                        <Input 
                            id="pickup-input"
                            placeholder="Enter pickup location"
                            style={{ marginBottom: '16px' }}
                        />
                    </Autocomplete>
                    <DatePicker
                        placeholder="Pickup Date"
                        style={{ width: '100%', marginBottom: '16px' }}
                        onChange={(date, dateString) => setPickupDate(dateString)}
                    />
                    <TimePicker
                        placeholder="Pickup Time"
                        style={{ width: '100%', marginBottom: '16px' }}
                        onChange={(time, timeString) => setPickupTime(timeString)}
                    />
                    <Autocomplete onLoad={onDropLoad} onPlaceChanged={onDropPlaceChanged}>
                        <Input 
                            id="drop-input"
                            placeholder="Enter drop location"
                            style={{ marginBottom: '16px' }}
                        />
                    </Autocomplete>
                    <Select
                        defaultValue={1}
                        style={{ width: '100%', marginBottom: '16px' }}
                        onChange={(value) => {
                            setCapacity(value);
                            setShareSpace(value < 1);
                        }}
                    >
                        <Option value={0.3}>1/3</Option>
                        <Option value={0.5}>1/2</Option>
                        <Option value={1}>1</Option>
                    </Select>
                    {capacity < 1 && (
                        <Checkbox
                            checked={shareSpace}
                            onChange={(e) => setShareSpace(e.target.checked)}
                            style={{ marginBottom: '16px' }}
                        >
                            Share space with another customer
                        </Checkbox>
                    )}
                    <Checkbox
                        checked={returnTrip}
                        onChange={(e) => setReturnTrip(e.target.checked)}
                        style={{ marginBottom: '16px' }}
                    >
                        Return Trip
                    </Checkbox>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <div style={{ height: '400px', width: '100%', marginBottom: '16px' }}>
                        <GoogleMap
                            mapContainerStyle={{ height: '100%', width: '100%' }}
                            center={pickupLocation && dropLocation ? { lat: (pickupLocation.lat + dropLocation.lat) / 2, lng: (pickupLocation.lng + dropLocation.lng) / 2 } : { lat: 6.9271, lng: 79.8612 }}
                            zoom={10}
                        >
                            {directions && <DirectionsRenderer directions={directions} />}
                        </GoogleMap>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Button type="primary" block onClick={showConfirmationModal}>
                        Make Booking
                    </Button>
                </Col>
            </Row>
            <Modal
    title="Confirm Booking"
    visible={isModalVisible}
    onOk={handleOk}
    onCancel={handleCancel}
    width={600}
>
    <p><strong>Pickup Location:</strong> {pickupLocation?.address}</p>
    <p><strong>Drop Location:</strong> {dropLocation?.address}</p>
    <p><strong>Pickup Date:</strong> {pickupDate}</p>
    <p><strong>Pickup Time:</strong> {pickupTime}</p>
    <p><strong>Return Trip:</strong> {returnTrip ? 'Yes' : 'No'}</p>
    <p><strong>Distance:</strong> {distance.toFixed(2)} km</p>
    <p><strong>Drop Date & Time:</strong> {calculatedDropDateTime?.date} {calculatedDropDateTime?.time}</p>
    <p><strong>Total Price:</strong> LKR {charge.total}</p>
</Modal>

        </div>
    );
};

BookingDetails.propTypes = {
    selectedVehicle: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        preferredArea: PropTypes.string.isRequired,
        capacity: PropTypes.number.isRequired,
        capacityUnit: PropTypes.string.isRequired,
        photoUrl: PropTypes.string.isRequired,
        chargePerKm: PropTypes.number.isRequired,
    }).isRequired,
};

export default BookingDetails;
