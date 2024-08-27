import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Pagination, Button } from 'antd';
import PropTypes from 'prop-types';
import httpService from '../../../services/httpService';
import './VehicleSelection.css';

const { Search } = Input;

const VehicleSelection = ({ onVehicleSelect }) => {
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [vehiclesPerPage] = useState(6);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await httpService.get('/customer/vehicles');
                const data = response.data; // Access the data property
                setVehicles(data);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            }
        };

        fetchVehicles();
    }, []);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleFilterChange = (value) => setFilterType(value === filterType ? '' : value);

    const filteredVehicles = vehicles.filter(vehicle => {
        return (
            vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterType === '' || vehicle.type.toLowerCase() === filterType.toLowerCase())
        );
    });

    const indexOfLastVehicle = currentPage * vehiclesPerPage;
    const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
    const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const filterButtons = ['Lorry', 'Freezer', 'Van', 'Tipper Truck', 'Container'];

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
                            cover={<img alt={vehicle.type} src={vehicle.photoUrl} className="vehicle-image" />}
                            onClick={() => onVehicleSelect(vehicle)}
                        >
                            <Card.Meta
                                title={`Vehicle ID: ${vehicle.id}`}
                                description={
                                    <>
                                        <p><strong>Type:</strong> {vehicle.type}</p>
                                        <p><strong>Capacity:</strong> {vehicle.capacity} {vehicle.capacityUnit}</p>
                                        <p><strong>Charge Per Km:</strong> LKR  {vehicle.chargePerKm}</p>
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
