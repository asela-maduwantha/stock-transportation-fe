import React from 'react';
import { Layout, Typography, Row, Col, Card } from 'antd';
import { CarOutlined, ToolOutlined, BarChartOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const FleetManagement = () => {
  const features = [
    {
      title: "Vehicle Tracking",
      description: "Real-time GPS tracking for all fleet vehicles.",
      icon: <CarOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    },
    {
      title: "Maintenance Scheduling",
      description: "Automated maintenance alerts and scheduling.",
      icon: <ToolOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    },
    {
      title: "Performance Analytics",
      description: "Comprehensive reports on fleet performance and efficiency.",
      icon: <BarChartOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    },
    {
      title: "Safety Management",
      description: "Monitor driver behavior and ensure compliance with safety standards.",
      icon: <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    }
  ];

  return (
    <Layout>
      <Content style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ color: '#fdb940', textAlign: 'center', marginBottom: '40px' }}>
          Fleet Management
        </Title>
        <Paragraph style={{ textAlign: 'center', marginBottom: '40px' }}>
          Our comprehensive fleet management solution helps you optimize operations, reduce costs, and improve efficiency.
        </Paragraph>
        <Row gutter={[16, 16]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card 
                hoverable 
                style={{ height: '100%', textAlign: 'center' }}
                cover={
                  <div style={{ padding: '24px' }}>
                    {feature.icon}
                  </div>
                }
              >
                <Card.Meta
                  title={<span style={{ color: '#fdb940' }}>{feature.title}</span>}
                  description={<Paragraph>{feature.description}</Paragraph>}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default FleetManagement;