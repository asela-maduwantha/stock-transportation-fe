import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Select, Button, Modal, Form, message } from 'antd';
import httpService from '../../../services/httpService';

const { Title } = Typography;
const { Option } = Select;

const OwnerUnassignedVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [assignDriverModalVisible, setAssignDriverModalVisible] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const ownerId = localStorage.getItem('ownerId');

    const fetchUnassignedVehicles = useCallback(async () => {
        try {
            const response = await httpService.get(`/owner/unassignedVehi/${ownerId}`);
            setVehicles(response.data);
        } catch (error) {
            console.log(error)
            message.error('Failed to fetch unassigned vehicles.');
        }
    }, [ownerId]);

    const fetchUnassignedDrivers = useCallback(async () => {
        try {
            const response = await httpService.get(`/owner/unassignedDrivers/${ownerId}`);
            setDrivers(response.data);
        } catch (error) {
            message.error('Failed to fetch unassigned drivers.');
        }
    }, [ownerId]);

    useEffect(() => {
        fetchUnassignedVehicles();
        fetchUnassignedDrivers();
    }, [fetchUnassignedVehicles, fetchUnassignedDrivers]);

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

    const filteredDrivers = selectedVehicle?.heavyVehicle
        ? drivers.filter(driver => driver.heavyVehicleLic)
        : drivers;

    return (
        <div>
            <Title level={2} style={{ textAlign: 'center' }}>Vehicle Management</Title>
            <Row gutter={[16, 16]} justify="center">
                {vehicles.map(vehicle => (
                    <Col key={vehicle.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            title={vehicle.name}
                            extra={
                                <Button type="link" onClick={() => showAssignDriverModal(vehicle)}>
                                    Assign Driver
                                </Button>
                            }
                            style={{ marginBottom: '16px' }}
                        >
                            <div style={{ marginBottom: '16px' }}>
                                <img src={vehicle.photoUrl} alt="Vehicle" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                            </div>
                            <p><strong>Type:</strong> {vehicle.type}</p>
                            <p><strong>Registration:</strong> {vehicle.regNo}</p>
                            <p><strong>Owner:</strong> {vehicle.ownerName}</p>
                            <p><strong>Owner Contact:</strong> {vehicle.ownerContact}</p>
                            <p><strong>Driver:</strong> {vehicle.driver || 'Not Assigned'}</p>
                            <p><strong>Driver Contact:</strong> {vehicle.driverContact || 'Not Available'}</p>
                        </Card>
                    </Col>
                ))}
            </Row>
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
                            <img src={selectedDriver.driverImage || 'https://via.placeholder.com/150'} alt="Driver" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                            <p>{selectedDriver.firstName} {selectedDriver.lastName}</p>
                        </div>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default OwnerUnassignedVehicles;