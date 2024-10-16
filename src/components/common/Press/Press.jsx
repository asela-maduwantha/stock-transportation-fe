import React from 'react';
import { Layout, Typography, List, Card, Space, Button } from 'antd';
import { FileTextOutlined, DownloadOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Press = () => {
  const pressReleases = [
    {
      title: "Company Name Expands Fleet with 100 New Electric Vehicles",
      date: "May 15, 2024",
      summary: "In a move towards sustainability, Company Name adds 100 electric vehicles to its fleet, reducing carbon emissions by 30%.",
    },
    {
      title: "Company Name Launches Revolutionary Logistics AI",
      date: "April 2, 2024",
      summary: "Our new AI-powered logistics system optimizes routes and reduces delivery times by up to 25%.",
    },
    {
      title: "Company Name Reports Record Growth in Q1 2024",
      date: "March 31, 2024",
      summary: "Company Name sees a 40% increase in revenue compared to Q1 2023, attributed to expansion in shared bookings and sustainable transport solutions.",
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ color: '#fdb940', textAlign: 'center' }}>
            <FileTextOutlined /> Press Center
          </Title>
          <Paragraph style={{ textAlign: 'center' }}>
            Stay up to date with the latest news and announcements from Company Name.
          </Paragraph>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            size="large"
            style={{ backgroundColor: '#fdb940', borderColor: '#fdb940', marginBottom: '20px' }}
          >
            Download Press Kit
          </Button>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 1,
              xl: 1,
              xxl: 1,
            }}
            dataSource={pressReleases}
            renderItem={item => (
              <List.Item>
                <Card 
                  hoverable 
                  style={{ marginBottom: '20px' }}
                >
                  <Title level={4} style={{ color: '#fdb940' }}>{item.title}</Title>
                  <Paragraph type="secondary">{item.date}</Paragraph>
                  <Paragraph>{item.summary}</Paragraph>
                  <Button type="link" style={{ color: '#fdb940', paddingLeft: 0 }}>Read More</Button>
                </Card>
              </List.Item>
            )}
          />
          <Paragraph style={{ textAlign: 'center', marginTop: '20px' }}>
            For press inquiries, please contact our media relations team at press@companyname.com
          </Paragraph>
        </Space>
      </Content>
    </Layout>
  );
};

export default Press;