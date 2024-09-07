import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, message, Input, Row, Col, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Meta } = Card;

const AssignedVehicles = () => {
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignedVehicles();
  }, []);

  useEffect(() => {
    const filtered = assignedVehicles.filter(vehicle => 
      vehicle.vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicle.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${vehicle.driver.firstName} ${vehicle.driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, assignedVehicles]);

  const fetchAssignedVehicles = async () => {
    try {
      const ownerId = localStorage.getItem('ownerId');
      const response = await httpService.get(`/owner/assignedDrivers/${ownerId}`);
      setAssignedVehicles(response.data);
      setFilteredVehicles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned vehicles:', error);
      message.error('Failed to fetch assigned vehicles');
      setLoading(false);
    }
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setDriverModalVisible(true);
  };

  const handleRemoveDriver = async (assignId) => {
    try {
      await httpService.delete(`/owner/unassignDriver/${assignId}`);
      message.success('Driver removed successfully');
      fetchAssignedVehicles(); // Refresh the list
    } catch (error) {
      console.error('Error removing driver:', error);
      message.error('Failed to remove driver');
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Assigned Vehicles</h2>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search by vehicle type, registration number, or driver name"
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: '20px', width: '100%', maxWidth: '400px' }}
      />
      <Spin spinning={loading} tip="Loading vehicles...">
        {filteredVehicles.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredVehicles.map((item) => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <Card
                  hoverable
                  cover={<img alt={item.vehicle.type} src={item.vehicle.photoUrl} style={{ height: 200, objectFit: 'cover' }} />}
                  actions={[
                    <Button key="view" onClick={() => handleViewDriver(item.driver)}>View Driver</Button>,
                    <Button key="remove" onClick={() => handleRemoveDriver(item.id)}>Remove Driver</Button>,
                  ]}
                >
                  <Meta
                    title={`${item.vehicle.type} - ${item.vehicle.regNo}`}
                    description={`Driver: ${item.driver.firstName} ${item.driver.lastName}`}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No vehicles found" />
        )}
      </Spin>
      <Modal
        title="Driver Details"
        visible={driverModalVisible}
        onCancel={() => setDriverModalVisible(false)}
        footer={null}
      >
        {selectedDriver && (
          <div>
            <p><strong>Name:</strong> {selectedDriver.firstName} {selectedDriver.lastName}</p>
            <p><strong>Email:</strong> {selectedDriver.email}</p>
            <p><strong>Phone:</strong> {selectedDriver.phoneNumber}</p>
            <p><strong>Address:</strong> {selectedDriver.address}</p>
            <img src={selectedDriver.photoUrl} alt="Driver" style={{ maxWidth: '100%', marginBottom: '10px' }} />
            <p><strong>License:</strong> <a href={selectedDriver.licenseUrl} target="_blank" rel="noopener noreferrer">View License</a></p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssignedVehicles;
