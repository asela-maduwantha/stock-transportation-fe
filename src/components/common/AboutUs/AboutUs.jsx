import React from 'react';
import { Row, Col, Card, Button } from 'antd';
import './AboutUs.css'; 
import DeliveryImage from '../../../assets/images/man.jpg';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <Row>
        <Col span={24}>
          <h1>About Us</h1>
          <p>
            The effective transportation of goods and items is critical to the success of businesses and the satisfaction of individuals relying on timely, cost-effective, and reliable delivery services. However, the current ways of sourcing transportation options often bring issues such as inefficiency, unfair charging, and difficulty in accessing reliable services. These issues can result in delays, increased costs, and dissatisfaction for both vehicle owners and customers.
          </p>
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
            <Button type="primary">Read More</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AboutUs;
