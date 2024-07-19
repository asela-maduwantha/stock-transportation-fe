import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Pagination, Layout, Button, Checkbox, Typography, message, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Autocomplete, DirectionsRenderer, Marker } from '@react-google-maps/api';
import axios from 'axios';

const { Content, Sider } = Layout;
const { Search } = Input;
const { Title } = Typography;

const dummyVehicles = [
    {
        id: 1,
        name: 'Ford',
        type: 'Car',
        registrationNumber: 'ABC123',
        ownerName: 'John Doe',
        ownerContact: '123-456-7890',
        driverName: 'Jack Black',
        driverContact: '123-123-1234',
        pricePerKm: 0.75, 
        photo: 'https://www.usatoday.com/gcdn/-mm-/37fe7faa7fed7edcc51e71fe40f11cfe37c3daaa/c=131-0-2174-1536/local/-/media/2018/01/19/USATODAY/USATODAY/636519786314510593-18-FUSI-SE-34FrntPassStaticRooftop-mj.jpg',
    },
    {
        id: 2,
        name: 'Volvo FH 16 750 I-Torque',
        type: 'Lorry',
        registrationNumber: 'DEF456',
        ownerName: 'Jane Smith',
        ownerContact: '098-765-4321',
        driverName: 'Jim White',
        driverContact: '098-098-0987',
        pricePerKm: 0.85, 
        photo: 'https://w0.peakpx.com/wallpaper/183/582/HD-wallpaper-volvo-fh16-2016-truck-with-trailer-fh16-750.jpg',
    },
    {
        id: 3,
        name: 'Mercedes-Benz Sprinter 316 CDI',
        type: 'Freezer',
        registrationNumber: 'GHI789',
        ownerName: 'Jim Brown',
        ownerContact: '555-555-5555',
        driverName: 'Sara Green',
        driverContact: '555-555-1234',
        pricePerKm: 0.60, 
        photo: 'https://res.cloudinary.com/ho5waxsnl/image/upload/c_fill,f_auto,h_540,q_auto,w_960/nxn5ijz891d121pf0etwoojlhzx2',
    },
    {
        id: 4,
        name: 'Ford Transit Van',
        type: 'Van',
        registrationNumber: 'JKL012',
        ownerName: 'Sara White',
        ownerContact: '222-333-4444',
        driverName: 'Mike Blue',
        driverContact: '222-333-1234',
        pricePerKm: 0.65, 
        photo: 'https://hips.hearstapps.com/hmg-prod/images/2023-ford-transit-trail-02-copy-1667400261.jpg?crop=1.00xw:0.502xh;0,0.264xh&resize=1200:*',
    },
    {
        id: 5,
        name: 'Scania G 450 8x4 Tipper Truck',
        type: 'Tipper Truck',
        registrationNumber: 'MNO345',
        ownerName: 'Emily Black',
        ownerContact: '666-777-8888',
        driverName: 'Robert Yellow',
        driverContact: '666-777-1234',
        pricePerKm: 0.95, 
        photo: 'https://ik.imagekit.io/mvcommercial/uploads/vehicle_image/image/89063/8273de57-4be3-435d-a9c5-f070e5c1fdaa.jpg?tr=w-1280,h-960',
    },
    {
        id: 6,
        name: 'Container Truck',
        type: 'Container',
        registrationNumber: 'PQR678',
        ownerName: 'Mike Green',
        ownerContact: '999-888-7777',
        driverName: 'John Grey',
        driverContact: '999-888-1234',
        pricePerKm: 1.10, 
        photo: 'https://t4.ftcdn.net/jpg/01/61/88/53/360_F_161885373_yLlpczh3yHXIrypS3CA5Q0jLJQYXLEhA.jpg',
    },
];

const VehicleBooking = () => {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [vehiclesPerPage] = useState(6);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);
    const [returnTrip, setReturnTrip] = useState(false);
    const [distance, setDistance] = useState(0);
    const [directions, setDirections] = useState(null);
    const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
    const [dropAutocomplete, setDropAutocomplete] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const navigate = useNavigate();

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleFilterChange = (value) => setFilterType(value === filterType ? '' : value);

    const filteredVehicles = dummyVehicles.filter(vehicle => {
        return (
            vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterType === '' || vehicle.type.toLowerCase() === filterType.toLowerCase())
        );
    });

    const indexOfLastVehicle = currentPage * vehiclesPerPage;
    const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
    const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleBook = async (vehicle) => {
        if (!pickupLocation || !dropLocation) {
            message.error('Please select pickup and drop locations.');
            return;
        }

        try {
            const response = await axios.post('/api/bookings', {
                vehicle: vehicle.id,
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
                returnTrip,
                distance,
                totalPrice: calculatePrice(),
            });

            if (response.data.success) {
                navigate('/payment', {
                    state: {
                        bookingId: response.data.bookingId,
                        vehicle,
                        pickupLocation,
                        dropLocation,
                        returnTrip,
                        distance,
                        advanceAmount: calculatePrice() * 0.2,
                        totalPrice: calculatePrice(),
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

    const handleChat = (vehicle) => {
        console.log(`Chat with ${vehicle.ownerName}`);
    };

    const calculatePrice = () => {
        if (!selectedVehicle || !distance) {
            return 0;
        }

        let basePrice = selectedVehicle.pricePerKm;
        let totalPrice = basePrice * distance;

        if (returnTrip) {
            totalPrice *= 2;
        }

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
        if (pickupLocation && dropLocation) {
            setIsModalVisible(true);
        } else {
            message.error('Please select both pickup and drop locations.');
        }
    };

    const handleOk = () => {
        setIsModalVisible(false);
        handleBook(selectedVehicle);
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
                    }
                }
            );
        }
    }, [pickupLocation, dropLocation]);

    const filterButtons = ['Car', 'Lorry', 'Freezer', 'Van', 'Tipper Truck', 'Container'];

    return (
        <LoadScript
            googleMapsApiKey='AIzaSyAyRG15a19j3uqI_7uEbQ6CZrp-h2KP0eM'
            libraries={['places']}
        >
            <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', width: '100%' }}>
                <Content style={{ padding: '24px' }}>
                    <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>Vehicle Booking</Title>
                    <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '24px' }}>
                        <Col xs={24} sm={16} md={12} lg={8}>
                            <Search 
                                placeholder="Search vehicles" 
                                onChange={handleSearchChange} 
                                style={{ width: '100%' }} 
                            />
                        </Col>
                    </Row>
                    <Row gutter={[8, 16]} justify="center" style={{ marginBottom: '24px' }}>
                        {filterButtons.map(type => (
                            <Col key={type}>
                                <Button 
                                    type={filterType === type ? 'primary' : 'default'}
                                    onClick={() => handleFilterChange(type)}
                                    style={{ minWidth: '100px' }}
                                >
                                    {type}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                    <Row gutter={[16, 16]}>
                        {currentVehicles.map(vehicle => (
                            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={vehicle.id}>
                                <Card
                                    hoverable
                                    style={{ height: '100%' }}
                                    cover={<img alt={vehicle.name} src={vehicle.photo} style={{ objectFit: 'cover', height: 200 }} />}
                                    onClick={() => setSelectedVehicle(vehicle)}
                                >
                                    <Card.Meta
                                        title={vehicle.name}
                                        description={
                                            <>
                                                <p><strong>Type:</strong> {vehicle.type}</p>
                                                <p><strong>Registration:</strong> {vehicle.registrationNumber}</p>
                                                <p><strong>Owner:</strong> {vehicle.ownerName}</p>
                                                <Button type="primary" onClick={() => setSelectedVehicle(vehicle)} block>Select</Button>
                                            </>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <Pagination
                        current={currentPage}
                        pageSize={vehiclesPerPage}
                        total={filteredVehicles.length}
                        onChange={paginate}
                        style={{ marginTop: 24, textAlign: 'center' }}
                    />
                </Content>
                {selectedVehicle && (
                    <Sider width={400} theme="light" style={{ padding: '24px', backgroundColor: '#fff' }}>
                        <Button 
                            type="text" 
                            icon={<CloseOutlined />} 
                            onClick={() => setSelectedVehicle(null)} 
                            style={{ float: 'right', marginBottom: '16px' }}
                        />
                        <div style={{ overflowY: 'auto', height: '100%' }}>
                            <Card
                                cover={<img alt={selectedVehicle.name} src={selectedVehicle.photo} style={{ objectFit: 'cover', height: 200 }} />}
                                style={{ marginBottom: '16px' }}
                            >
                                <Card.Meta
                                    title={<Title level={4}>{selectedVehicle.name}</Title>}
                                    description={
                                        <>
                                            <p><strong>Type:</strong> {selectedVehicle.type}</p>
                                            <p><strong>Registration:</strong> {selectedVehicle.registrationNumber}</p>
                                            <p><strong>Owner:</strong> {selectedVehicle.ownerName}</p>
                                            <p><strong>Owner Contact:</strong> {selectedVehicle.ownerContact}</p>
                                            <p><strong>Driver:</strong> {selectedVehicle.driverName}</p>
                                            <p><strong>Driver Contact:</strong> {selectedVehicle.driverContact}</p>
                                        </>
                                    }
                                />
                            </Card>
                            <Autocomplete
                                onLoad={onPickupLoad}
                                onPlaceChanged={onPickupPlaceChanged}
                            >
                                <Input 
                                    placeholder="Select Pickup Location" 
                                    style={{ width: '100%', marginBottom: '16px' }}
                                />
                            </Autocomplete>
                            <Autocomplete
                                onLoad={onDropLoad}
                                onPlaceChanged={onDropPlaceChanged}
                            >
                                <Input 
                                    placeholder="Select Drop Location" 
                                    style={{ width: '100%', marginBottom: '16px' }}
                                />
                            </Autocomplete>
                            <Checkbox 
                                checked={returnTrip} 
                                onChange={(e) => setReturnTrip(e.target.checked)} 
                                style={{ marginBottom: '16px' }}
                            >
                                Return Trip
                            </Checkbox>
                            <p><strong>Distance:</strong> {distance.toFixed(2)} km</p>
                            <p><strong>Total Price:</strong> LKR {calculatePrice()}</p>
                            <Button type="primary" onClick={showConfirmationModal} block style={{ marginBottom: '8px' }}>Confirm Booking</Button>
                            <Button onClick={() => handleChat(selectedVehicle)} block>Chat with Owner</Button>
                        </div>
                    </Sider>
                )}
                <Modal
                    title="Confirm Booking"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    width={800}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            Cancel
                        </Button>,
                        <Button key="submit" type="primary" onClick={handleOk}>
                            Confirm Booking
                        </Button>,
                    ]}
                >
                    <p><strong>Vehicle:</strong> {selectedVehicle?.name}</p>
                    <p><strong>Pickup Location:</strong> {pickupLocation?.address}</p>
                    <p><strong>Drop Location:</strong> {dropLocation?.address}</p>
                    <p><strong>Distance:</strong> {distance.toFixed(2)} km</p>
                    <p><strong>Total Price:</strong> LKR {calculatePrice()}</p>
                    <div style={{ height: '400px', width: '100%' }}>
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={pickupLocation}
                            zoom={10}
                        >
                            {pickupLocation && <Marker position={pickupLocation} />}
                            {dropLocation && <Marker position={dropLocation} />}
                            {directions && <DirectionsRenderer directions={directions} />}
                        </GoogleMap>
                    </div>
                </Modal>
            </Layout>
        </LoadScript>
    );
};

export default VehicleBooking;