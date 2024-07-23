import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, GithubOutlined } from '@ant-design/icons';
import './FooterComponent.css'; // Create a CSS file for additional styling

const { Footer } = Layout;
const { Text } = Typography;

const FooterComponent = () => {
  return (
    <Footer className="footer">
      <div className="footer-content">
        <Space direction="vertical" size="middle" align="center">
          <Text type="secondary">© 2024 Your Company Name. All rights reserved.</Text>
          <Space>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FacebookOutlined style={{ fontSize: '20px' }} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <TwitterOutlined style={{ fontSize: '20px' }} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <GithubOutlined style={{ fontSize: '20px' }} />
            </a>
          </Space>
        </Space>
      </div>
    </Footer>
  );
};

export default FooterComponent;
