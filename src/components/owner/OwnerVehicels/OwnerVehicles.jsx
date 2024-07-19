import React, { useState } from 'react';
import { Card, Row, Col, Typography, Select, Button, Modal, Form, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const dummyVehicles = [
    {
        id: 1,
        name: 'Ford',
        type: 'Car',
        registrationNumber: 'ABC123',
        ownerName: 'John Doe',
        ownerContact: '123-456-7890',
        driver: 'Jack Black',
        driverContact: '123-123-1234',
        vehicleImage: 'https://t4.ftcdn.net/jpg/01/61/88/53/360_F_161885373_yLlpczh3yHXIrypS3CA5Q0jLJQYXLEhA.jpg',
    },
    {
        id: 2,
        name: 'Volvo FH 16 750 I-Torque',
        type: 'Lorry',
        registrationNumber: 'DEF456',
        ownerName: 'Jane Smith',
        ownerContact: '098-765-4321',
        driver: 'Jim White',
        driverContact: '098-098-0987',
        vehicleImage: 'https://t4.ftcdn.net/jpg/01/61/88/53/360_F_161885373_yLlpczh3yHXIrypS3CA5Q0jLJQYXLEhA.jpg',
    },
    {
        id: 3,
        name: 'Mercedes-Benz Sprinter 316 CDI',
        type: 'Freezer',
        registrationNumber: 'GHI789',
        ownerName: 'Jim Brown',
        ownerContact: '555-555-5555',
        driver: 'Sara Green',
        driverContact: '555-555-1234',
        vehicleImage: 'https://t4.ftcdn.net/jpg/01/61/88/53/360_F_161885373_yLlpczh3yHXIrypS3CA5Q0jLJQYXLEhA.jpg',
    },
];

const dummyDrivers = [
    {
        id: 1,
        name: 'Jack Black',
        contact: '123-123-1234',
        driverImage: 'https://t3.ftcdn.net/jpg/03/02/47/02/360_F_302470233_yJh7nrqKTLzPMXEdZ5IvyeL9xOetipPW.jpg',
    },
    {
        id: 2,
        name: 'Jim White',
        contact: '098-098-0987',
        driverImage: 'https://t3.ftcdn.net/jpg/03/02/47/02/360_F_302470233_yJh7nrqKTLzPMXEdZ5IvyeL9xOetipPW.jpg',
    },
    {
        id: 3,
        name: 'Sara Green',
        contact: '555-555-1234',
        driverImage: 'https://t3.ftcdn.net/jpg/03/02/47/02/360_F_302470233_yJh7nrqKTLzPMXEdZ5IvyeL9xOetipPW.jpg',
    },
    {
        id: 4,
        name: 'Mike Blue',
        contact: '222-333-1234',
        driverImage: 'https://via.placeholder.com/150',
    },
];

const OwnerVehicles = () => {
    const [vehicles, setVehicles] = useState(dummyVehicles);
    const [drivers] = useState(dummyDrivers); // Removed setDrivers
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [assignDriverModalVisible, setAssignDriverModalVisible] = useState(false);
    const [editVehicleModalVisible, setEditVehicleModalVisible] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    const showAssignDriverModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setAssignDriverModalVisible(true);
    };

    const handleAssignDriver = () => {
        if (!selectedVehicle || !selectedDriver) {
            message.error('Please select both vehicle and driver.');
            return;
        }

        const updatedVehicles = vehicles.map(vehicle => {
            if (vehicle.id === selectedVehicle.id) {
                return {
                    ...vehicle,
                    driver: selectedDriver.name,
                    driverContact: selectedDriver.contact,
                };
            }
            return vehicle;
        });

        setVehicles(updatedVehicles);
        setAssignDriverModalVisible(false);
        setSelectedVehicle(null);
        setSelectedDriver(null);
        message.success('Driver assigned successfully!');
    };

    const handleRemoveDriver = (vehicle) => {
        const updatedVehicles = vehicles.map(v => {
            if (v.id === vehicle.id) {
                return { ...v, driver: null, driverContact: null };
            }
            return v;
        });

        setVehicles(updatedVehicles);
        message.success('Driver removed successfully!');
    };

    const showEditVehicleModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setEditVehicleModalVisible(true);
    };

    const handleEditVehicle = (values) => {
        const updatedVehicles = vehicles.map(vehicle => {
            if (vehicle.id === selectedVehicle.id) {
                return {
                    ...vehicle,
                    name: values.name,
                    type: values.type,
                    registrationNumber: values.registrationNumber,
                    ownerName: values.ownerName,
                    ownerContact: values.ownerContact,
                };
            }
            return vehicle;
        });

        setVehicles(updatedVehicles);
        setEditVehicleModalVisible(false);
        setSelectedVehicle(null);
        message.success('Vehicle details updated successfully!');
    };

    const handleCancelEditVehicle = () => {
        setEditVehicleModalVisible(false);
        setSelectedVehicle(null);
    };

    const vehicleFormInitialValues = selectedVehicle ? {
        name: selectedVehicle.name,
        type: selectedVehicle.type,
        registrationNumber: selectedVehicle.registrationNumber,
        ownerName: selectedVehicle.ownerName,
        ownerContact: selectedVehicle.ownerContact,
    } : {};

    return (
        <div>
            <Title level={2} style={{ textAlign: 'center' }}>Vehicle Management</Title>
            <Row gutter={[16, 16]} justify="center">
                {vehicles.map(vehicle => (
                    <Col key={vehicle.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            title={vehicle.name}
                            extra={
                                <div>
                                    <Button type="link" onClick={() => showEditVehicleModal(vehicle)}>
                                        <EditOutlined /> Edit
                                    </Button>
                                    <Button type="link" onClick={() => handleRemoveDriver(vehicle)}>
                                        <DeleteOutlined /> Remove Driver
                                    </Button>
                                    <Button type="link" onClick={() => showAssignDriverModal(vehicle)}>
                                        Assign Driver
                                    </Button>
                                </div>
                            }
                            style={{ marginBottom: '16px' }}
                        >
                            <div style={{ marginBottom: '16px' }}>
                                <img src={vehicle.vehicleImage} alt="Vehicle" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                            </div>
                            <p><strong>Type:</strong> {vehicle.type}</p>
                            <p><strong>Registration:</strong> {vehicle.registrationNumber}</p>
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
                            onChange={(value) => setSelectedDriver(drivers.find(driver => driver.id.toString() === value))}
                            style={{ width: '100%' }}
                        >
                            {drivers.map(driver => (
                                <Option key={driver.id} value={driver.id.toString()}>
                                    {driver.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {selectedDriver && (
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <img src={selectedDriver.driverImage} alt="Driver" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                            <p>{selectedDriver.name}</p>
                        </div>
                    )}
                </Form>
            </Modal>
            <Modal
                title="Edit Vehicle Details"
                visible={editVehicleModalVisible}
                onCancel={handleCancelEditVehicle}
                footer={null}
            >
                <Form
                    layout="vertical"
                    initialValues={vehicleFormInitialValues}
                    onFinish={handleEditVehicle}
                >
                    <Form.Item
                        name="name"
                        label="Vehicle Name"
                        rules={[{ required: true, message: 'Please enter the vehicle name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Vehicle Type"
                        rules={[{ required: true, message: 'Please enter the vehicle type' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="registrationNumber"
                        label="Registration Number"
                        rules={[{ required: true, message: 'Please enter the registration number' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="ownerName"
                        label="Owner Name"
                        rules={[{ required: true, message: 'Please enter the owner name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="ownerContact"
                        label="Owner Contact"
                        rules={[{ required: true, message: 'Please enter the owner contact' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OwnerVehicles;
