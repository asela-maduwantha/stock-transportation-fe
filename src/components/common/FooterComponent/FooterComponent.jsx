import React from 'react';
import { Layout, Typography, Space, Row, Col, Divider } from 'antd';
import { FacebookOutlined, TwitterOutlined, GithubOutlined, LinkedinOutlined } from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Text } = Typography;

const FooterComponent = () => {
  const footerStyle = {
    backgroundColor: '#ebebeb',
    padding: '40px 20px',
    textAlign: 'center',
  };

  const footerContentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const footerTitleStyle = {
    marginBottom: '16px',
    color: '#333',
    fontSize: '18px',
  };

  const linkStyle = {
    color: '#333',
    textDecoration: 'none',
    display: 'block',
    padding: '8px 0',
    transition: 'color 0.3s ease',
  };

  const iconStyle = {
    fontSize: '24px',
    color: 'rgb(253, 185, 64)',
    transition: 'color 0.3s ease',
    margin: '0 10px',
  };

  const sectionStyle = {
    marginBottom: '30px',
    textAlign: 'left',
  };

  const socialSectionStyle = {
    marginTop: '30px',
  };

  const footerBottomStyle = {
    marginTop: '30px',
  };

  return (
    <Footer style={footerStyle}>
      <div style={footerContentStyle}>
        <Row gutter={[16, 32]}>
          {/* Company Info Section */}
          <Col xs={24} sm={8} style={sectionStyle}>
            <Title level={4} style={footerTitleStyle}>Company</Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <a href="/about-us" style={linkStyle}>About Us</a>
              <a href="/careers" style={linkStyle}>Careers</a>
              <a href="/press" style={linkStyle}>Press</a>
              <a href="/contact-us" style={linkStyle}>Contact Us</a>
            </Space>
          </Col>

          {/* Services Section */}
          <Col xs={24} sm={8} style={sectionStyle}>
            <Title level={4} style={footerTitleStyle}>Services</Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <a href="/transport-services" style={linkStyle}>Transport Services</a>
              <a href="/logistics-solutions" style={linkStyle}>Logistics Solutions</a>
              <a href="/fleet-management" style={linkStyle}>Fleet Management</a>
              <a href="/tracking" style={linkStyle}>Tracking</a>
            </Space>
          </Col>

          {/* Quick Links Section */}
          <Col xs={24} sm={8} style={sectionStyle}>
            <Title level={4} style={footerTitleStyle}>Quick Links</Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <a href="/privacy-policy" style={linkStyle}>Privacy Policy</a>
              <a href="/terms-of-service" style={linkStyle}>Terms of Service</a>
              <a href="/faqs" style={linkStyle}>FAQs</a>
              <a href="/support" style={linkStyle}>Support</a>
            </Space>
          </Col>
        </Row>
        
        <Divider style={{ margin: '20px 0' }} />

        {/* Social Media Section */}
        <div style={socialSectionStyle}>
          <Title level={4} style={footerTitleStyle}>Follow Us</Title>
          <Space size="large" wrap>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
              <FacebookOutlined />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
              <TwitterOutlined />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
              <GithubOutlined />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
              <LinkedinOutlined />
            </a>
          </Space>
        </div>

        {/* Footer Bottom */}
        <div style={footerBottomStyle}>
          <Text type="secondary">© 2024 Gulf Stock Transportation. All rights reserved.</Text>
        </div>
      </div>
    </Footer>
  );
};

export default FooterComponent;
