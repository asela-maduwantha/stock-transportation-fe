import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Input, Button, Checkbox, DatePicker, TimePicker, Select, Modal, message } from 'antd';
import { GoogleMap, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';
import './BookingDetails.css';

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
    const [loadingTime, setLoadingTime] = useState(30);
    const [calculatedDropDateTime, setCalculatedDropDateTime] = useState(null);
    const [travelDuration, setTravelDuration] = useState(null);

    const navigate = useNavigate();

    const calculatePrice = () => {
        if (!selectedVehicle || !distance) {
            return 0;
        }

        let basePrice = selectedVehicle.pricePerKm;
        let totalPrice = basePrice * distance;

        if (returnTrip) {
            totalPrice *= 2;
        }

        totalPrice *= capacity;

        return totalPrice.toFixed(2);
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
        }
    };

    const showConfirmationModal = () => {
        if (pickupLocation && dropLocation && pickupDate && pickupTime) {
            setIsModalVisible(true);
        } else {
            message.error('Please select all booking details.');
        }
    };

    const handleOk = async () => {
        setIsModalVisible(false);
        try {
            const response = await httpService.post('/api/bookings', {
                vehicle: selectedVehicle.id,
                pickupLocation: {
                    address: pickupLocation.address,
                    lat: pickupLocation.lat,
                    lng: pickupLocation.lng,
                },
                dropLocation: {
                    address: dropLocation.address,
                    lat: dropLocation.lat,
                    lng: dropLocation.lng,
                },
                pickupDate,
                pickupTime,
                dropDate: calculatedDropDateTime.date,
                dropTime: calculatedDropDateTime.time,
                returnTrip,
                distance,
                totalPrice: calculatePrice(),
                capacity,
                shareSpace,
                loadingTime,
            });

            if (response.data.success) {
                navigate('/payment', {
                    state: {
                        bookingId: response.data.bookingId,
                        vehicle: selectedVehicle,
                        pickupLocation,
                        dropLocation,
                        pickupDate,
                        pickupTime,
                        dropDate: calculatedDropDateTime.date,
                        dropTime: calculatedDropDateTime.time,
                        returnTrip,
                        distance,
                        advanceAmount: calculatePrice() * 0.2,
                        totalPrice: calculatePrice(),
                        loadingTime,
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
        if (pickupLocation && dropLocation) {
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
                        const duration = result.routes[0].legs[0].duration.value; 
                        const durationMoment = moment.duration(duration, 'seconds');
                        setTravelDuration({
                            days: durationMoment.days(),
                            hours: durationMoment.hours(),
                            minutes: durationMoment.minutes(),
                            seconds: durationMoment.seconds(),
                        });
                        const pickupDateTime = moment(`${pickupDate} ${pickupTime}`);
                        const dropDateTime = pickupDateTime.clone().add(duration, 'seconds').add(loadingTime * 2, 'minutes');
                        setCalculatedDropDateTime({
                            date: dropDateTime.format('YYYY-MM-DD'),
                            time: dropDateTime.format('HH:mm'),
                        });
                    }
                }
            );
        }
    }, [pickupLocation, dropLocation, pickupDate, pickupTime, loadingTime]);

    return (
        <div className="booking-details">
            <Card
                cover={<img alt={selectedVehicle.name} src={selectedVehicle.photo} className="vehicle-image" />}
            >
                <Card.Meta
                    title={selectedVehicle.name}
                    description={
                        <>
                            <p><strong>Type:</strong> {selectedVehicle.type}</p>
                            <p><strong>Registration:</strong> {selectedVehicle.registrationNumber}</p>
                            <p><strong>Owner:</strong> {selectedVehicle.ownerName}</p>
                            <p><strong>Price Per Km:</strong> ${selectedVehicle.pricePerKm}</p>
                        </>
                    }
                />
            </Card>
            <Autocomplete onLoad={onPickupLoad} onPlaceChanged={onPickupPlaceChanged}>
                <Input 
                    placeholder="Enter pickup location"
                    className="location-input"
                />
            </Autocomplete>
            <DatePicker
                placeholder="Pickup Date"
                className="date-picker"
                onChange={(date, dateString) => setPickupDate(dateString)}
            />
            <TimePicker
                placeholder="Pickup Time"
                className="time-picker"
                onChange={(time, timeString) => setPickupTime(timeString)}
            />
            <Autocomplete onLoad={onDropLoad} onPlaceChanged={onDropPlaceChanged}>
                <Input 
                    placeholder="Enter drop location"
                    className="location-input"
                />
            </Autocomplete>
            <Select
                defaultValue={30}
                className="loading-time-select"
                onChange={(value) => setLoadingTime(value)}
            >
                <Option value={30}>30 min</Option>
                <Option value={60}>1 hour</Option>
                <Option value={90}>1 hour and 30 min</Option>
                <Option value={120}>2 hours</Option>
            </Select>
            <Select
                defaultValue={1}
                className="capacity-select"
                onChange={(value) => {
                    setCapacity(value);
                    if (value < 1) {
                        setShareSpace(true);
                    } else {
                        setShareSpace(false);
                    }
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
                    className="share-space-checkbox"
                >
                    Share space with another customer
                </Checkbox>
            )}
            <Checkbox
                checked={returnTrip}
                onChange={(e) => setReturnTrip(e.target.checked)}
                className="return-trip-checkbox"
            >
                Return Trip
            </Checkbox>
            <GoogleMap
                mapContainerStyle={{ height: '300px', width: '100%', marginBottom: '16px' }}
                center={{ lat: 6.9271, lng: 79.8612 }}
                zoom={10}
            >
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
            <Button type="primary" block onClick={showConfirmationModal} className="confirm-button">
                Confirm Booking
            </Button>
            <Modal
                title="Confirm Booking"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p><strong>Pickup Location:</strong> {pickupLocation ? pickupLocation.address : ''}</p>
                <p><strong>Drop Location:</strong> {dropLocation ? dropLocation.address : ''}</p>
                <p><strong>Pickup Date:</strong> {pickupDate}</p>
                <p><strong>Pickup Time:</strong> {pickupTime}</p>
                <p><strong>Distance:</strong> {distance.toFixed(2)} km</p>
                <p><strong>Travel Duration:</strong> {travelDuration ? `${travelDuration.days} days ${travelDuration.hours} hours ${travelDuration.minutes} minutes ${travelDuration.seconds} seconds` : ''}</p>
                <p><strong>Loading and Unloading Time:</strong> {loadingTime * 2} minutes</p>
                <p><strong>Total Time:</strong> {travelDuration ? `${travelDuration.days} days ${travelDuration.hours + Math.floor((travelDuration.minutes + loadingTime * 2) / 60)} hours ${((travelDuration.minutes + loadingTime * 2) % 60)} minutes` : ''}</p>
                <p><strong>Total Price:</strong> ${calculatePrice()}</p>
            </Modal>
        </div>
    );
};

BookingDetails.propTypes = {
    selectedVehicle: PropTypes.object.isRequired,
};

export default BookingDetails;
