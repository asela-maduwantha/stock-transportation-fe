import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Typography, Layout, Card, Row, Col, Statistic, Avatar, List, Tag, Space } from 'antd';
import { CarOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import OwnerUnassignedVehicles from '../OwnerUnassignedVehicles/OwnerUnassignedVehicles';
import AssignedVehicles from '../AssignedVehicles/AssignedVehicles';
import httpService from '../../../services/httpService';

const { Title, Text } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const OwnerVehicles = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [statistics, setStatistics] = useState({ total: 0, assigned: 0, unassigned: 0 });
  const [loading, setLoading] = useState(true);
  const ownerId = localStorage.getItem('ownerId');

  const fetchVehicleStatistics = useCallback(async () => {
    try {
      const response = await httpService.get(`/owner/vehicleStatistics/${ownerId}`);
      setStatistics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicle statistics:', error);
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchVehicleStatistics();
  }, [fetchVehicleStatistics]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const renderVehicleList = (vehicles) => (
    <List
      itemLayout="horizontal"
      dataSource={vehicles}
      renderItem={(vehicle) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar size={64} icon={<CarOutlined />} src={vehicle.photoUrl} />}
            title={<Text strong>{`${vehicle.type} - ${vehicle.regNo}`}</Text>}
            description={
              <Space direction="vertical">
                <Text><EnvironmentOutlined /> Preferred Area: {vehicle.preferredArea}</Text>
                <Text>Capacity: {vehicle.capacity} {vehicle.capacityUnit}</Text>
                <Space>
                  <Tag color="blue">{vehicle.status}</Tag>
                  {vehicle.heavyVehicle && <Tag color="orange">Heavy Vehicle</Tag>}
                </Space>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>
          Vehicle Management Dashboard
        </Title>

        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Vehicles"
                value={statistics.total}
                prefix={<CarOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Assigned Vehicles"
                value={statistics.assigned}
                prefix={<UserOutlined />}
                loading={loading}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Unassigned Vehicles"
                value={statistics.unassigned}
                prefix={<CarOutlined />}
                loading={loading}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type="card"
            size="large"
          >
            <TabPane 
              tab={
                <span>
                  <UserOutlined />
                  Assigned Vehicles
                </span>
              } 
              key="1"
            >
              <AssignedVehicles renderVehicleList={renderVehicleList} />
            </TabPane>
            <TabPane 
              tab={
                <span>
                  <CarOutlined />
                  Unassigned Vehicles
                </span>
              } 
              key="2"
            >
              <OwnerUnassignedVehicles renderVehicleList={renderVehicleList} />
            </TabPane>
          </Tabs>
        </Card>
      </Content>
    </Layout>
  );
};

export default OwnerVehicles;
