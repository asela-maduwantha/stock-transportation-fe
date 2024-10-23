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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <CarOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
          <Title level={4} style={{ marginTop: '16px', color: '#8c8c8c' }}>
            No vehicle assigned
          </Title>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <CarOutlined style={{ color: '#faad14' }} />
          <span>My Vehicle</span>
        </Space>
      }
      style={{ maxWidth: '800px', margin: '0 auto' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Image Section */}
        <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5' }}>
          {vehicle.photoUrl && (
            <Image
              src={vehicle.photoUrl}
              alt={vehicle.regNo}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Details Section */}
        <Descriptions column={1}>
          <Descriptions.Item 
            label={<Space><CarOutlined />Registration Number</Space>}
          >
            <Typography.Text strong>{vehicle.regNo}</Typography.Text>
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
    </Card>
  );
};

export default Vehicles;