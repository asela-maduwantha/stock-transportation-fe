import React, { useState } from 'react';
import { Card, Row, Col, Input, Pagination, Button } from 'antd';
import PropTypes from 'prop-types';
import './VehicleSelection.css';

const { Search } = Input;

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

const VehicleSelection = ({ onVehicleSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [vehiclesPerPage] = useState(6);

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

    const filterButtons = ['Car', 'Lorry', 'Freezer', 'Van', 'Tipper Truck', 'Container'];

    return (
        <>
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
                            cover={<img alt={vehicle.name} src={vehicle.photo} className="vehicle-image" />}
                            onClick={() => onVehicleSelect(vehicle)}
                        >
                            <Card.Meta
                                title={vehicle.name}
                                description={
                                    <>
                                        <p><strong>Type:</strong> {vehicle.type}</p>
                                        <p><strong>Registration:</strong> {vehicle.registrationNumber}</p>
                                        <p><strong>Owner:</strong> {vehicle.ownerName}</p>
                                        <Button type="primary" onClick={() => onVehicleSelect(vehicle)} block>Select</Button>
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
                style={{ marginTop: '16px', textAlign: 'center' }}
            />
        </>
    );
};

VehicleSelection.propTypes = {
    onVehicleSelect: PropTypes.func.isRequired,
};

export default VehicleSelection;