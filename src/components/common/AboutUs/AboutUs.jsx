import React, { useState } from 'react';
import { Row, Col, Card, Button } from 'antd';
import './AboutUs.css'; 
import DeliveryImage from '../../../assets/images/about.jpg';

const AboutUs = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const buttonStyle = {
    backgroundColor: '#fdb940',
    color: '#fff',
    border: 'none',
    transition: 'background-color 0.3s ease, opacity 0.3s ease',
    opacity: isHovered ? 0.8 : 1,
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
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
              Our client owns a lorry and a container truck that he offers for transportation services. His main challenge is attracting and effectively promoting his services to customers. 
              {/* Initial description */}
            </p>
            <p>
              Currently, there is often a struggle for transport service providers and customers to connect easily. Customers also find it challenging to determine which vehicle best suits their needs and its capacity.
              {/* Additional content to be toggled */}
            </p>
            
            {expanded && (
              <>
                <p>
                  With our platform, vehicle owners can create profiles for their vehicles, including specifications like load capacity, dimensions, and pricing options. Customers can filter these options to find the perfect match for their transportation needs.
                </p>
                <p>
                  Additionally, our website offers an intuitive booking system, where customers can schedule and confirm services, and vehicle owners receive real-time notifications for new bookings.
                </p>
                <p>
                  The marketplace is designed to reduce the communication gap between service providers and customers. By bringing more transparency, it ensures that customers can make informed decisions about the transportation services they choose.
                </p>
                <p>
                  We are also working on implementing a feature for real-time tracking of the transport vehicles. This will help customers know the exact location of their hired vehicles and manage their schedules better.
                </p>
              </>
            )}

            <Button
              type="primary"
              style={buttonStyle}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={toggleExpanded}
            >
              {expanded ? 'Show Less' : 'Read More'}
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AboutUs;
