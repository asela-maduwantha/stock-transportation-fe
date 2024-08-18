import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Select, Button, Modal, Form, message, Input, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Title } = Typography;
const { Option } = Select;
const { Meta } = Card;

const OwnerUnassignedVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [assignDriverModalVisible, setAssignDriverModalVisible] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driversLoading, setDriversLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const ownerId = localStorage.getItem('ownerId');

    const fetchUnassignedVehicles = useCallback(async () => {
        try {
            const response = await httpService.get(`/owner/unassignedVehi/${ownerId}`);
            setVehicles(response.data);
            setFilteredVehicles(response.data);
        } catch (error) {
            console.log(error);
            message.error('Failed to fetch unassigned vehicles.');
        } finally {
            setLoading(false);
        }
    }, [ownerId]);

    const fetchUnassignedDrivers = useCallback(async () => {
        setDriversLoading(true);
        try {
            const response = await httpService.get(`/owner/unassignedDrivers/${ownerId}`);
            setDrivers(response.data);
        } catch (error) {
            message.error('Failed to fetch unassigned drivers.');
        } finally {
            setDriversLoading(false);
        }
    }, [ownerId]);

    useEffect(() => {
        fetchUnassignedVehicles();
        fetchUnassignedDrivers();
    }, [fetchUnassignedVehicles, fetchUnassignedDrivers]);

    useEffect(() => {
        const filtered = vehicles.filter(vehicle => 
            vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.regNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredVehicles(filtered);
    }, [searchTerm, vehicles]);

    const showAssignDriverModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setAssignDriverModalVisible(true);
    };

    const handleAssignDriver = async () => {
        if (!selectedVehicle || !selectedDriver) {
            message.error('Please select both vehicle and driver.');
            return;
        }

        try {
            await httpService.post('/owner/assignDriver', {
                vehicleId: selectedVehicle.id,
                driverId: selectedDriver.id,
                ownerId: ownerId
            });
            fetchUnassignedVehicles();
            fetchUnassignedDrivers();
            setAssignDriverModalVisible(false);
            setSelectedVehicle(null);
            setSelectedDriver(null);
            message.success('Driver assigned successfully!');
        } catch (error) {
            message.error('Failed to assign driver.');
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const filteredDrivers = selectedVehicle?.heavyVehicle
        ? drivers.filter(driver => driver.heavyVehicleLic)
        : drivers;

    return (
        <div style={{ padding: '20px' }}>
            <Title level={3} style={{ marginBottom: '20px' }}>Unassigned Vehicles</Title>
            <Input
                prefix={<SearchOutlined />}
                placeholder="Search by vehicle type or registration number"
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: '20px', width: '100%', maxWidth: '400px' }}
            />
            {loading ? (
                <Spin tip="Loading vehicles..." size="large" />
            ) : filteredVehicles.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {filteredVehicles.map(vehicle => (
                        <Col xs={24} sm={12} md={8} lg={6} key={vehicle.id}>
                            <Card
                                hoverable
                                cover={<img alt={vehicle.name} src={vehicle.photoUrl} style={{ height: 200, objectFit: 'cover' }} />}
                                actions={[
                                    <Button key="assign" type="primary" onClick={() => showAssignDriverModal(vehicle)}>
                                        Assign Driver
                                    </Button>
                                ]}
                            >
                                <Meta
                                    title={`${vehicle.type} - ${vehicle.regNo}`}
                                    description={
                                        <>
                                            <p><strong>Preferred Area:</strong> {vehicle.preferredArea}</p>
                                            <p><strong>Capacity:</strong> {vehicle.capacity} {vehicle.capacityUnit}</p>
                                            <p><strong>Owner:</strong> {vehicle.ownerName}</p>
                                            <p><strong>Owner Contact:</strong> {vehicle.ownerContact}</p>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="No unassigned vehicles found" />
            )}
            <Modal
                title="Assign Driver"
                visible={assignDriverModalVisible}
                onCancel={() => setAssignDriverModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setAssignDriverModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="assign" type="primary" onClick={handleAssignDriver}>
                        Assign
                    </Button>,
                ]}
            >
                {driversLoading ? (
                    <Spin tip="Loading drivers..." size="large" />
                ) : (
                    <Form layout="vertical">
                        <Form.Item label="Select Driver">
                            <Select
                                placeholder="Select driver"
                                onChange={(value) => setSelectedDriver(filteredDrivers.find(driver => driver.id.toString() === value))}
                                style={{ width: '100%' }}
                            >
                                {filteredDrivers.map(driver => (
                                    <Option key={driver.id} value={driver.id.toString()}>
                                        {driver.firstName} {driver.lastName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {selectedDriver && (
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <img src={selectedDriver.photoUrl || 'https://via.placeholder.com/150'} alt="Driver" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                                <p><strong>Name:</strong> {selectedDriver.firstName} {selectedDriver.lastName}</p>
                                <p><strong>Address:</strong> {selectedDriver.address}</p>
                                <p><strong>Phone:</strong> {selectedDriver.phoneNumber}</p>
                                <p><strong>Email:</strong> {selectedDriver.email}</p>
                                <p><strong>Heavy Vehicle License:</strong> {selectedDriver.heavyVehicleLic ? 'Yes' : 'No'}</p>
                            </div>
                        )}
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default OwnerUnassignedVehicles;
