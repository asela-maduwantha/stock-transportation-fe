import React from 'react';
import { Layout, Typography, Card, Row, Col } from 'antd';
import { CarOutlined, TeamOutlined, GlobalOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const TransportServices = () => {
  const services = [
    {
      title: "Individual Transport",
      description: "Personalized transport solutions for individual needs.",
      icon: <CarOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    },
    {
      title: "Shared Bookings",
      description: "Economical and eco-friendly shared rides for common routes.",
      icon: <TeamOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    },
    {
      title: "Long Distance Transport",
      description: "Reliable long-distance transportation services.",
      icon: <GlobalOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ color: '#fdb940', textAlign: 'center', marginBottom: '40px' }}>
          Our Transport Services
        </Title>
        <Row gutter={[16, 16]}>
          {services.map((service, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card 
                hoverable 
                style={{ height: '100%' }}
                cover={
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    {service.icon}
                  </div>
                }
              >
                <Card.Meta
                  title={<span style={{ color: '#fdb940' }}>{service.title}</span>}
                  description={<Paragraph>{service.description}</Paragraph>}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default TransportServices;