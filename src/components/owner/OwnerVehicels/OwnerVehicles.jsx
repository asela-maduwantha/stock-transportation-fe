import React, { useState, useCallback } from 'react';
import { Tabs, Typography, Layout, Card, Row, Col, Statistic } from 'antd';
import { CarOutlined, UserOutlined } from '@ant-design/icons';
import OwnerUnassignedVehicles from '../OwnerUnassignedVehicles/OwnerUnassignedVehicles';
import AssignedVehicles from '../AssignedVehicles/AssignedVehicles';

const { Title } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const OwnerVehicles = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [statistics, setStatistics] = useState({ total: 0, assigned: 0, unassigned: 0 });

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const updateStatistics = useCallback((assignedCount, unassignedCount) => {
    setStatistics({
      total: assignedCount + unassignedCount,
      assigned: assignedCount,
      unassigned: unassignedCount
    });
  }, []);

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
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Assigned Vehicles"
                value={statistics.assigned}
                prefix={<UserOutlined />}
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
              <AssignedVehicles updateStatistics={updateStatistics} />
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
              <OwnerUnassignedVehicles updateStatistics={updateStatistics} />
            </TabPane>
          </Tabs>
        </Card>
      </Content>
    </Layout>
  );
};

export default OwnerVehicles;