import React, { useState, useEffect } from 'react';
import { Typography, Select, Input, Button, List, Card, Tag, Spin, Modal } from 'antd';
import { SearchOutlined, EnvironmentOutlined, CarOutlined, DollarOutlined } from '@ant-design/icons';
import CostCalculator from '../../customer/CostCalculator/CostCalculator'; // Make sure to import the CostCalculator component
import './HomeSearch.css';
import httpService from '../../../services/httpService';

const { Title } = Typography;
const { Option } = Select;

const vehicleCategories = ['Select','All', 'Lorry', 'Freezer', 'Van', 'Tipper Truck', 'Container'];

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Select');
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await httpService.get('/customer/vehicles');
        setVehicles(response.data);
        setFilteredVehicles(response.data);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    const filtered = vehicles.filter(vehicle => 
      (category === 'All' || vehicle.type === category) &&
      vehicle.preferredArea.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, category, vehicles]);

  const handleSearch = () => {
    const filtered = vehicles.filter(vehicle => 
      (category === 'All' || vehicle.type === category) &&
      vehicle.preferredArea.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  };

  const handleBookNow = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedVehicle(null);
  };

  return (
    <div className="home-search-container">
      <div className="blur-background"></div>
      <div className="content">
        <Title level={2} className="main-title">
          Experience the ease and efficiency of stock transportation with Gulf Transportation Solution.
        </Title>
        <div className="search-container">
          <div className="search-wrapper">
            <Select 
              defaultValue="Select" 
              onChange={(value) => setCategory(value)}
              className="category-select"
              bordered={false}
            >
              {vehicleCategories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
            <div className="divider"></div>
            <Input 
              placeholder="Search by preferred area" 
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
              className="search-input"
              bordered={false}
            />
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
              className="search-button"
              disabled={category === 'Select'}
            >
              Search
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : filteredVehicles.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
            dataSource={filteredVehicles}
            className="vehicle-list"
            renderItem={item => (
              <List.Item>
                <Card 
                  hoverable
                  cover={<img alt={item.name} src={item.photoUrl} className="vehicle-image" />}
                  className="vehicle-card"
                >
                  <Tag color="blue" className="vehicle-type">{item.type}</Tag>
                  <Title level={4}>{item.preferredArea}</Title>
                  <div className="vehicle-details">
                    <span><CarOutlined /> Capacity: {item.capacity} {item.capacityUnit}</span>
                    <span><DollarOutlined /> {item.chargePerKm} LKR/km</span>
                  </div>
                  <Button type="primary" className="book-button" onClick={() => handleBookNow(item)}>Calculate Cost</Button>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <div className="no-results">No vehicles found</div>
        )}
      </div>

      <Modal
        title="Cost Calculator"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedVehicle && <CostCalculator selectedVehicle={selectedVehicle} />}
      </Modal>
    </div>
  );
};

export default HomeSearch;