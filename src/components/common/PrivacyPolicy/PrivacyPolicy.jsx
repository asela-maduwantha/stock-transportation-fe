import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const PrivacyPolicy = () => {
  return (
    <Layout>
      <Content style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ color: '#fdb940' }}>
            <LockOutlined /> Privacy Policy
          </Title>
          <Paragraph>
            At [Your Company Name], we are committed to protecting your privacy and ensuring the security of your personal information.
          </Paragraph>
          <Title level={4}>Information We Collect</Title>
          <Paragraph>
            We collect information such as your name, contact details, and booking information to provide and improve our services.
          </Paragraph>
          <Title level={4}>How We Use Your Information</Title>
          <Paragraph>
            We use your information to process bookings, provide customer support, and enhance our services. We do not sell your personal information to third parties.
          </Paragraph>
          <Title level={4}>Data Security</Title>
          <Paragraph>
            We implement various security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
          </Paragraph>
          {/* Add more sections as needed */}
        </Space>
      </Content>
    </Layout>
  );
};

export default PrivacyPolicy;