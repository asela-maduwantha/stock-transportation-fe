import React, { useState } from 'react';
import { Typography, Select, Input, Button, List, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './HomeSearch.css';

const { Title } = Typography;
const { Option } = Select;

const vehicleCategories = ['Lorry', 'Freezer', 'Van', 'Tipper Truck'];

// Mock data for demonstration
const mockVehicles = [
  {
    id: 1, type: 'Lorry', name: 'Lorry A', capacity: '5 tons', 
    image: 'https://images.pexels.com/photos/11087837/pexels-photo-11087837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', pricePerKm: '10 USD', 
    ownerName: 'John Doe', driverName: 'Mike Smith'
  },
  {
    id: 2, type: 'Freezer', name: 'Freezer B', capacity: '2 tons', 
    image: 'https://images.pexels.com/photos/11087837/pexels-photo-11087837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', pricePerKm: '15 USD', 
    ownerName: 'Jane Roe', driverName: 'Alice Johnson'
  },
  {
    id: 3, type: 'Van', name: 'Van C', capacity: '1 ton', 
    image: 'https://images.pexels.com/photos/2533092/pexels-photo-2533092.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', pricePerKm: '8 USD', 
    ownerName: 'James Bond', driverName: 'David Brown'
  },
  {
    id: 4, type: 'Tipper Truck', name: 'Tipper D', capacity: '3 tons', 
    image: 'https://media.istockphoto.com/id/474221742/photo/truck-tipping-gravel.webp?s=2048x2048&w=is&k=20&c=e9OP00U461TzIap_BEwL6A2Z1oHP1tbA9EAEMKzDlwk=', pricePerKm: '12 USD', 
    ownerName: 'Emma White', driverName: 'Chris Green'
  },
];

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [vehicles, setVehicles] = useState([]);

  const handleSearch = () => {
    const filteredVehicles = mockVehicles.filter(vehicle => 
      (category === 'All' || vehicle.type === category) &&
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setVehicles(filteredVehicles);
  };

  return (
    <div className="home-search-container">
      <div className="blur-background"></div>
      <div className="content">
        <Title level={2} className="main-title">
          Experience the ease and efficiency of stock transportation with Gulf Transportation Solution.
        </Title>
        <div className="search-container">
          <Select 
            defaultValue="All" 
            style={{ width: 150 }}
            onChange={(value) => setCategory(value)}
            bordered={false}
            className="category-select"
          >
            <Option value="All">All Categories</Option>
            {vehicleCategories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
          <Input 
            placeholder="Search vehicles" 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button 
            type="primary" 
            icon={<SearchOutlined />}
            onClick={handleSearch}
            className="search-button"
          >
            Search
          </Button>
        </div>

        {vehicles.length > 0 && (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
            dataSource={vehicles}
            className="vehicle-list"
            renderItem={item => (
              <List.Item>
                <Card 
                  hoverable
                  cover={<img alt={item.name} src={item.image} />}
                  actions={[
                    <Button type="primary" className="book-button" key='book-now'>
                      Book Now
                    </Button>
                  ]}
                  className="vehicle-card"
                >
                  <Card.Meta 
                    title={item.name} 
                    description={(
                      <div>
                        <p><strong>Type:</strong> {item.type}</p>
                        <p><strong>Capacity:</strong> {item.capacity}</p>
                        <p><strong>Price per km:</strong> {item.pricePerKm}</p>
                        <p><strong>Owner:</strong> {item.ownerName}</p>
                        <p><strong>Driver:</strong> {item.driverName}</p>
                      </div>
                    )} 
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default HomeSearch;