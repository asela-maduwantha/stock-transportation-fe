import React from 'react';
import { Layout, Typography, List, Card } from 'antd';
import { BoxPlotOutlined, BarChartOutlined, DeploymentUnitOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const LogisticsSolutions = () => {
  const solutions = [
    {
      title: "Inventory Management",
      description: "Optimize your inventory levels and reduce carrying costs.",
      icon: <BoxPlotOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    },
    {
      title: "Supply Chain Analytics",
      description: "Gain insights into your supply chain performance and identify improvement areas.",
      icon: <BarChartOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    },
    {
      title: "Distribution Network Optimization",
      description: "Streamline your distribution network for maximum efficiency.",
      icon: <DeploymentUnitOutlined style={{ fontSize: '32px', color: '#fdb940' }} />
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2} style={{ color: '#fdb940', textAlign: 'center', marginBottom: '40px' }}>
          Logistics Solutions
        </Title>
        <Paragraph style={{ textAlign: 'center', marginBottom: '40px' }}>
          We offer comprehensive logistics solutions to optimize your supply chain and improve operational efficiency.
        </Paragraph>
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 3,
          }}
          dataSource={solutions}
          renderItem={item => (
            <List.Item>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '100%' }}
              >
                {item.icon}
                <Title level={4} style={{ color: '#fdb940', marginTop: '16px' }}>{item.title}</Title>
                <Paragraph>{item.description}</Paragraph>
              </Card>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
};

export default LogisticsSolutions;