import React, { useState } from 'react';
import { Layout, Typography, Input, Button, Card, Space } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Tracking = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);

  const handleTracking = () => {
    // This is where you would typically make an API call to get the tracking information
    // For this example, we'll just set some mock data
    setTrackingResult({
      status: 'In Transit',
      location: 'Chicago, IL',
      estimatedDelivery: '2023-06-15'
    });
  };

  return (
    <Layout>
      <Content style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ color: '#fdb940', textAlign: 'center' }}>
            <EnvironmentOutlined /> Track Your Shipment
          </Title>
          <Paragraph style={{ textAlign: 'center' }}>
            Enter your tracking number below to get real-time updates on your shipment.
          </Paragraph>
          <Input
            size="large"
            placeholder="Enter tracking number"
            prefix={<SearchOutlined />}
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <Button 
            type="primary" 
            size="large" 
            onClick={handleTracking}
            style={{ backgroundColor: '#fdb940', borderColor: '#fdb940', width: '100%' }}
          >
            Track
          </Button>
          {trackingResult && (
            <Card title="Tracking Result" style={{ marginTop: '20px' }}>
              <p><strong>Status:</strong> {trackingResult.status}</p>
              <p><strong>Current Location:</strong> {trackingResult.location}</p>
              <p><strong>Estimated Delivery:</strong> {trackingResult.estimatedDelivery}</p>
            </Card>
          )}
        </Space>
      </Content>
    </Layout>
  );
};

export default Tracking;