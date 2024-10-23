import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Spin, Image, Space, Typography } from 'antd';
import { CarOutlined, EnvironmentOutlined, InboxOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';


const { Title } = Typography;

const Vehicles = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const driverId = localStorage.getItem('driverId');

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const response = await httpService.get(`/driver/myVehicle/${driverId}`);
        setVehicle(response.data);
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchVehicleDetails();
    }
  }, [driverId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <Card className="w-full">
        <div className="text-center py-8">
          <CarOutlined className="text-4xl text-gray-400 mb-4" />
          <Title level={4}>No vehicle assigned</Title>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="w-full"
      title={
        <Space>
          <CarOutlined style={{ color: '#fdb940' }} />
          <span>My Vehicle</span>
        </Space>
      }
    >
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2">
          <Image
            src={vehicle.photoUrl}
            alt={vehicle.regNo}
            className="w-full rounded-lg object-cover"
          />
        </div>
        <div className="w-full lg:w-1/2">
          <Descriptions layout="vertical" column={1}>
            <Descriptions.Item 
              label={<Space><CarOutlined />Registration Number</Space>}
            >
              <span className="text-lg font-semibold">{vehicle.regNo}</span>
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><CarOutlined />Vehicle Type</Space>}
            >
              {vehicle.type}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><EnvironmentOutlined />Preferred Area</Space>}
            >
              {vehicle.preferredArea}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={<Space><InboxOutlined />Capacity</Space>}
            >
              {`${vehicle.capacity} ${vehicle.capacityUnit}`}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </Card>
  );
};

export default Vehicles;