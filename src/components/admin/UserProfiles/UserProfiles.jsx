import React, { useState, useEffect, useCallback } from 'react';
import { Card, Avatar, Tabs, List, Statistic, Row, Col,  Collapse, Tag } from 'antd';
import { UserOutlined, TeamOutlined, MailOutlined, PhoneOutlined, HomeOutlined, IdcardOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { TabPane } = Tabs;
const { Panel } = Collapse;

const UserProfiles = () => {
  const [activeTab, setActiveTab] = useState('owners');
  const [owners, setOwners] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [customers, setCustomers] = useState([]);

  const fetchDriversForOwners = useCallback(async (ownersList) => {
    const driversData = {};
    for (const owner of ownersList) {
      try {
        const response = await httpService.get(`/admin/drivers/${owner.id}`);
        driversData[owner.id] = response.data;
      } catch (error) {
        console.error(`Error fetching drivers for owner ${owner.id}:`, error);
        driversData[owner.id] = [];
      }
    }
    setDrivers(driversData);
  }, []);

  const fetchOwners = useCallback(async () => {
    try {
      const response = await httpService.get('/admin/owners');
      setOwners(response.data);
      fetchDriversForOwners(response.data);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  }, [fetchDriversForOwners]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await httpService.get('/admin/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'owners') {
      fetchOwners();
    } else if (activeTab === 'customers') {
      fetchCustomers();
    }
  }, [activeTab, fetchOwners, fetchCustomers]);

  const renderProfileCard = (profile, type) => {
    const isOwner = type === 'owner';
    const isDriver = type === 'driver';
    const isCustomer = type === 'customer';

    const getTagColor = () => {
      switch(type) {
        case 'owner':
          return 'blue';
        case 'driver':
          return 'green';
        case 'customer':
          return 'orange';
        default:
          return 'default';
      }
    };

    return (
      <Card
        hoverable
        style={{ width: 300, margin: '16px' }}
        cover={
          <div style={{ position: 'relative' }}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={profile.photoUrl || profile.profilePic}
              style={{ margin: '20px auto', display: 'block' }}
            />
            <Tag color={getTagColor()} style={{ position: 'absolute', top: 10, right: 10, fontSize: '14px' }}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Tag>
          </div>
        }
      >
        <Card.Meta
          title={`${profile.firstName} ${profile.lastName}`}
          description={
            <>
              <p><MailOutlined /> {profile.email}</p>
              <p><PhoneOutlined /> {profile.mobNo || profile.phoneNumber || profile.mobileNum}</p>
              <p><HomeOutlined /> {profile.address}</p>
              {(isOwner || isCustomer) && <p><IdcardOutlined /> {profile.nic}</p>}
              {isOwner && <p>GS Certificate: {profile.gsCertiUrl ? 'Available' : 'Not available'}</p>}
              {isDriver && (
                <>
                  <p>Heavy Vehicle License: {profile.heavyVehicleLic ? 'Yes' : 'No'}</p>
                  <p>Enabled: {profile.enabled ? 'Yes' : 'No'}</p>
                </>
              )}
            </>
          }
        />
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={8}>
            <Statistic title="Original" value={profile.originalBoookingCount} />
          </Col>
          <Col span={8}>
            <Statistic title="Shared" value={profile.sharedBookingCount} />
          </Col>
          <Col span={8}>
            <Statistic title="Total" value={profile.totalBookingCount} />
          </Col>
        </Row>
      
      </Card>
    );
  };

  const renderOwnerWithDrivers = (owner) => {
    return (
      <Collapse key={owner.id}>
        <Panel header={`${owner.firstName} ${owner.lastName}`} key={owner.id}>
          {renderProfileCard(owner, 'owner')}
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
            dataSource={drivers[owner.id] || []}
            renderItem={(driver) => renderProfileCard(driver, 'driver')}
          />
        </Panel>
      </Collapse>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><TeamOutlined /> Owners & Drivers</span>} key="owners" />
        <TabPane tab={<span><UserOutlined /> Customers</span>} key="customers" />
      </Tabs>
      {activeTab === 'owners' && (
        <List
          dataSource={owners}
          renderItem={renderOwnerWithDrivers}
        />
      )}
      {activeTab === 'customers' && (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
          dataSource={customers}
          renderItem={(customer) => renderProfileCard(customer, 'customer')}
        />
      )}
    </div>
  );
};

export default UserProfiles;