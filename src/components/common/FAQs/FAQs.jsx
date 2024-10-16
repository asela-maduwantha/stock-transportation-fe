import React from 'react';
import { Layout, Typography, Collapse, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const FAQs = () => {
  const faqData = [
    {
      question: "How do I book a shared ride?",
      answer: "To book a shared ride, select the 'Shared Ride' option when making your booking. You'll be matched with other customers going in the same direction."
    },
    {
      question: "Can I book a return trip?",
      answer: "Yes, you can book a return trip. During the booking process, select the 'Round Trip' option and specify your return date and time."
    },
    {
      question: "What types of vehicles are available?",
      answer: "We offer a range of vehicles including cars, vans, and trucks. The available options will be shown during the booking process based on your needs."
    },
    // Add more FAQs as needed
  ];

  return (
    <Layout>
      <Content style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ color: '#fdb940' }}>
            <QuestionCircleOutlined /> Frequently Asked Questions
          </Title>
          <Paragraph>
            Find answers to common questions about our services below. If you can&apos;t find what you&apos;re looking for, please contact our support team.
          </Paragraph>
          <Collapse accordion>
            {faqData.map((faq, index) => (
              <Panel header={faq.question} key={index}>
                <p>{faq.answer}</p>
              </Panel>
            ))}
          </Collapse>
        </Space>
      </Content>
    </Layout>
  );
};

export default FAQs;