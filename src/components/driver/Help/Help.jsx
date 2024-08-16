import React, { useState } from 'react';
import { Card, Typography, Input, Button, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const Help = () => {
  const [question, setQuestion] = useState('');

  const handleQuestionSubmit = () => {
    // Handle question submission logic here
    console.log('Submitted question:', question);
    setQuestion('');
  };

  const faqStyle = {
    marginBottom: '15px',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
  };

  const faqs = [
    { q: "How do I update my profile?", a: "Go to the Profile Settings page and update your information." },
    { q: "What should I do if I encounter an issue?", a: "Contact support at support@yourapp.com or call +1-800-123-4567." },
    { q: "How do I log out?", a: "Click the logout button in the sidebar menu." },
    { q: "How do I change my password?", a: "Go to Account Settings and select 'Change Password'." },
    { q: "Can I delete my account?", a: "Yes, you can delete your account from the Account Settings page." },
    { q: "How do I report a bug?", a: "Use the 'Report a Bug' feature in the Help menu or email bugs@yourapp.com." },
  ];

  return (
    <Card 
      title={<Title level={2} style={{textAlign: 'center'}}>Help & Support</Title>}
      style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', height: '80vh', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <Row gutter={16} style={{flex: 1}}>
        <Col xs={24} md={16} style={{paddingRight: '10px', overflowY: 'auto'}}>
          <Title level={3}>Frequently Asked Questions</Title>
          <Row gutter={16}>
            {faqs.map((faq, index) => (
              <Col key={index} xs={24} sm={12}>
                <div style={faqStyle}>
                  <Paragraph strong>{faq.q}</Paragraph>
                  <Paragraph>{faq.a}</Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </Col>

        <Col xs={24} md={8} style={{marginTop: '20px'}}>
          <Title level={3}>Ask a Question</Title>
          <TextArea
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            style={{marginBottom: '10px'}}
          />
          <Button type="primary" onClick={handleQuestionSubmit} block>
            Submit Question
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default Help;
