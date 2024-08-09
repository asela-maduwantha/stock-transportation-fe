import React, { useState } from 'react';
import { Row, Col, Card, Button } from 'antd';
import './AboutUs.css'; 
import DeliveryImage from '../../../assets/images/about.jpg';

const AboutUs = () => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    backgroundColor: '#fdb940',
    color: '#fff',
    border: 'none',
    transition: 'background-color 0.3s ease, opacity 0.3s ease',
    opacity: isHovered ? 0.8 : 1,
  };

  return (
    <div className="about-us-container">
      <Row justify="center" className="about-us-header">
        <Col>
          <h1>About Us</h1>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="about-us-content">
        <Col xs={24} md={12}>
          <img src={DeliveryImage} alt="Delivery" className="about-us-image" />
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} className="about-us-card">
            <h2>Gulf Stock Transportation</h2>
            <p>
              Our client owns a lorry and a container truck that he offers for transportation services. His main challenge is attracting and effectively promoting his services to customers. To overcome this, we proposed a website that can act as a platform for advertising and connecting with potential customers. The website will allow other vehicle owners to register their vehicles, creating a marketplace where customers can easily find and hire transportation services.
            </p>
            <p>
              Currently, there is often a struggle for transport service providers and customers to connect easily. Customers also find it challenging to determine which vehicle best suits their needs and its capacity. Our project aims to resolve these issues by providing a comprehensive solution. Upon completion, customers will be able to access information about transport service providers, including prices and vehicle capacities, and easily book the services they require.
            </p>
            <Button
              type="primary"
              style={buttonStyle}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Read More
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AboutUs;
