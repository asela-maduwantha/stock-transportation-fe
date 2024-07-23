import React, { useState } from 'react';
import { Tabs, Typography, Layout } from 'antd';
import OwnerUnassignedVehicles from '../OwnerUnassignedVehicles/OwnerUnassignedVehicles';
import AssignedVehicles from '../AssignedVehicles/AssignedVehicles';

const { Title } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const OwnerVehicles = () => {
  const [activeTab, setActiveTab] = useState('1');

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>
          Vehicle Management
        </Title>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          type="card"
          size="large"
          style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          <TabPane tab="Assigned Vehicles" key="1">
            <AssignedVehicles />
          </TabPane>
          <TabPane tab="Unassigned Vehicles" key="2">
            <OwnerUnassignedVehicles />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default OwnerVehicles;