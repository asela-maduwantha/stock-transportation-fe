import React from 'react';
import { Layout, Typography, List, Card, Space, Button, Input } from 'antd';
import { TeamOutlined, SearchOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Careers = () => {
  const jobOpenings = [
    {
      title: "Senior Software Engineer",
      department: "Technology",
      location: "San Francisco, CA",
      type: "Full-time",
    },
    {
      title: "Logistics Coordinator",
      department: "Operations",
      location: "Chicago, IL",
      type: "Full-time",
    },
    {
      title: "Customer Support Specialist",
      department: "Customer Service",
      location: "Remote",
      type: "Part-time",
    },
    {
      title: "Data Analyst",
      department: "Business Intelligence",
      location: "New York, NY",
      type: "Full-time",
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ color: '#fdb940', textAlign: 'center' }}>
            <TeamOutlined /> Careers at Gulf Stock Transports
          </Title>
          <Paragraph style={{ textAlign: 'center' }}>
            Join our team and help shape the future of transportation and logistics.
          </Paragraph>
          <Input
            size="large"
            placeholder="Search job openings"
            prefix={<SearchOutlined />}
            style={{ marginBottom: '20px' }}
          />
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
            dataSource={jobOpenings}
            renderItem={item => (
              <List.Item>
                <Card 
                  hoverable 
                  style={{ marginBottom: '20px' }}
                >
                  <Title level={4} style={{ color: '#fdb940' }}>{item.title}</Title>
                  <Paragraph><strong>Department:</strong> {item.department}</Paragraph>
                  <Paragraph><strong>Location:</strong> {item.location}</Paragraph>
                  <Paragraph><strong>Type:</strong> {item.type}</Paragraph>
                  <Button type="primary" style={{ backgroundColor: '#fdb940', borderColor: '#fdb940' }}>
                    Apply Now
                  </Button>
                </Card>
              </List.Item>
            )}
          />
          <Card style={{ textAlign: 'center', marginTop: '20px' }}>
            <Title level={4}>Don&apos;t see a position that fits your skills?</Title>
            <Paragraph>
              We&apos;re always looking for talented individuals to join our team. Send your resume to careers@companyname.com
            </Paragraph>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};

export default Careers;