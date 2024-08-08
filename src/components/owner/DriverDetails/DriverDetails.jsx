import React, { useState, useEffect } from 'react';
import { Card, Input, Row, Col, Tag, Modal, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService'; 

const { Meta } = Card;

const DriverDetails = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const ownerId = localStorage.getItem('ownerId');
        const response = await httpService.get(`/owner/drivers/${ownerId}`);
        setDrivers(response.data);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };

    fetchDrivers();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCardClick = (driver) => {
    setSelectedDriver(driver);
  };

  const closeModal = () => {
    setSelectedDriver(null);
  };

  const handleToggleDriver = async (id, enable) => {
    try {
      await httpService.put(`/owner/${enable ? 'enable' : 'disable'}Driver/${id}`);
      setDrivers(prevDrivers =>
        prevDrivers.map(driver =>
          driver.id === id ? { ...driver, enabled: enable } : driver
        )
      );
      message.success(`Driver ${enable ? 'enabled' : 'disabled'} successfully.`);
    } catch (error) {
      console.error(`Error ${enable ? 'enabling' : 'disabling'} driver:`, error);
      message.error(`Failed to ${enable ? 'enable' : 'disable'} driver.`);
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <Input
        placeholder="Search by name"
        prefix={<SearchOutlined />}
        onChange={handleSearch}
        style={{ marginBottom: '20px', width: '300px' }}
      />

      <Row gutter={[16, 16]}>
        {filteredDrivers.map(driver => (
          <Col xs={24} sm={12} md={8} lg={6} key={driver.id}>
            <Card
              hoverable
              cover={<img alt={`${driver.firstName} ${driver.lastName}`} src={driver.photoUrl || 'default-image-url.jpg'} style={{ height: '200px', objectFit: 'cover' }} />}
              style={{ marginBottom: '16px' }}
            >
              <Meta title={`${driver.firstName} ${driver.lastName}`} description={driver.address} />
              <Tag color={driver.enabled ? 'green' : 'red'} style={{ marginTop: '8px' }}>
                {driver.enabled ? 'Enabled' : 'Disabled'}
              </Tag>
              <div style={{ marginTop: '8px' }}>
                <Button
                  onClick={() => handleCardClick(driver)}
                  style={{ marginTop: '8px', width: '100%' }}
                >
                  View More
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Driver Details"
        visible={!!selectedDriver}
        onCancel={closeModal}
        footer={null}
      >
        {selectedDriver && (
          <div>
            <p><strong>Name:</strong> {`${selectedDriver.firstName} ${selectedDriver.lastName}`}</p>
            <p><strong>Phone Number:</strong> {selectedDriver.phoneNumber}</p>
            <p><strong>Email:</strong> {selectedDriver.email}</p>
            <p><strong>Address:</strong> {selectedDriver.address}</p>
            <p><strong>Heavy Vehicle License:</strong> {selectedDriver.heavyVehicleLic ? 'Yes' : 'No'}</p>
            {selectedDriver.licenseUrl && (
              <img src={selectedDriver.licenseUrl} alt="License" style={{ width: '100%', marginTop: '10px' }} />
            )}
            <div style={{ marginTop: '16px' }}>
              <Button 
                onClick={() => handleToggleDriver(selectedDriver.id, true)}
                style={{ backgroundColor: '#fdb940', color: 'white', marginRight: '8px' }}
                disabled={selectedDriver.enabled}
              >
                Enable
              </Button>
              <Button 
                onClick={() => handleToggleDriver(selectedDriver.id, false)}
                style={{ backgroundColor: 'crimson', color: 'white' }}
                disabled={!selectedDriver.enabled}
              >
                Disable
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DriverDetails;
