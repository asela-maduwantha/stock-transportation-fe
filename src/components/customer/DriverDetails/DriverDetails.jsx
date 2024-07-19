import React, { useState } from 'react';
import { Card, Input, Row, Col, Tag, Modal, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Meta } = Card;

const DriverDetails = () => {
  // Sample data for Sri Lankan drivers (replace with actual data)
  const [drivers] = useState([
    {
      id: 1,
      name: 'Saman Perera',
      imageUrl: 'https://t3.ftcdn.net/jpg/03/02/47/02/360_F_302470233_yJh7nrqKTLzPMXEdZ5IvyeL9xOetipPW.jpg',
      licenseNumber: '23456',
      vehicleModel: 'Toyota Prius',
      contactNumber: '+94711234567',
      email: 'saman.perera@example.com',
      status: 'Available',
      details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam rutrum nisi et felis ultricies ultricies.',
    },
    {
      id: 2,
      name: 'Kamal Silva',
      imageUrl: 'https://t3.ftcdn.net/jpg/04/15/37/08/360_F_415370827_jBpocm4ObfXPh4CgkubUXi4HxYXG909i.jpg',
      licenseNumber: '54321',
      vehicleModel: 'Honda Fit',
      contactNumber: '+94722345678',
      email: 'kamal.silva@example.com',
      status: 'On Trip',
      details: 'Fusce lobortis diam velit, vel malesuada est sollicitudin ac. Duis feugiat pulvinar fermentum.',
    },
    {
      id: 3,
      name: 'Nimal Fernando',
      imageUrl: 'https://media.istockphoto.com/id/1377893181/photo/shot-of-young-man-delivering-a-package-while-sitting-in-a-vehicle.jpg?s=612x612&w=0&k=20&c=yOMqI9TcSFRPKuLl40lUsjYmRkji9hoH_eUtKPUrZwk=',
      licenseNumber: '12345',
      vehicleModel: 'Suzuki Alto',
      contactNumber: '+94733456789',
      email: 'nimal.fernando@example.com',
      status: 'Available',
      details: 'Vivamus malesuada augue nec nulla scelerisque, eu cursus dolor consequat. Donec a felis vel risus malesuada cursus.',
    },
    {
      id: 4,
      name: 'Sunetha Ranasinghe',
      imageUrl: 'https://images.pexels.com/photos/787476/pexels-photo-787476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      licenseNumber: '67890',
      vehicleModel: 'Mazda Demio',
      contactNumber: '+94744567890',
      email: 'sunetha.ranasinghe@example.com',
      status: 'Available',
      details: 'Praesent ut nulla non lacus volutpat malesuada. Ut maximus ipsum vel felis hendrerit, nec mollis sapien vehicula.',
    },
    {
      id: 5,
      name: 'Priyantha Bandara',
      imageUrl: 'https://images.pexels.com/photos/5835014/pexels-photo-5835014.jpeg?auto=compress&cs=tinysrgb&w=600',
      licenseNumber: '98765',
      vehicleModel: 'Nissan Leaf',
      contactNumber: '+94755678901',
      email: 'priyantha.bandara@example.com',
      status: 'Available',
      details: 'Nulla facilisi. Proin varius metus ut metus fermentum, at venenatis nunc efficitur. Sed posuere, turpis in malesuada.',
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCardClick = (driver) => {
    setSelectedDriver(driver);
  };

  const closeModal = () => {
    setSelectedDriver(null);
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactClick = (contactNumber) => {
    // Implement your logic to handle contacting the driver (e.g., open messaging app, initiate call)
    window.open(`tel:${contactNumber}`);
  };

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
              onClick={() => handleCardClick(driver)}
              cover={<img alt={driver.name} src={driver.imageUrl} style={{ height: '200px', objectFit: 'cover' }} />}
              style={{ marginBottom: '16px' }}
            >
              <Meta title={driver.name} description={driver.vehicleModel} />
              <Tag color={driver.status === 'Available' ? 'green' : 'orange'} style={{ marginTop: '8px' }}>{driver.status}</Tag>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Driver Details"
        visible={selectedDriver !== null}
        onCancel={closeModal}
        footer={null}
      >
        {selectedDriver && (
          <div>
            <p><strong>Name:</strong> {selectedDriver.name}</p>
            <p><strong>Vehicle Model:</strong> {selectedDriver.vehicleModel}</p>
            <p><strong>License Number:</strong> {selectedDriver.licenseNumber}</p>
            <p><strong>Contact Number:</strong> {selectedDriver.contactNumber}</p>
            <p><strong>Email:</strong> {selectedDriver.email}</p>
            <p><strong>Status:</strong> <Tag color={selectedDriver.status === 'Available' ? 'green' : 'orange'}>{selectedDriver.status}</Tag></p>
            <p><strong>Details:</strong></p>
            <p>{selectedDriver.details}</p>
            <Button type="primary" onClick={() => handleContactClick(selectedDriver.contactNumber)}>Contact Driver</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DriverDetails;
