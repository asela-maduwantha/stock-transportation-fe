import React from 'react';
import { Layout, Card, Button, Form, Input, Row, Col, Typography } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Meta } = Card;
const { Content, Footer } = Layout;
import ContactImg from '../../../assets/images/contact.jpg'

const Contact = () => {
  return (
    <Layout>
      <Content style={{ padding: '0 20px', marginTop: '20px' }}>
        <div className="site-layout-content">
          <Title level={2} style={{ textAlign: 'center' }}>Contact Us</Title>
          <Row gutter={16} justify="center">
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card
                title="Get in Touch"
                bordered={false}
                style={{ width: '100%' }}
                cover={<img alt="placeholder" src={ContactImg} style={{ width: '100%' }} />}
              >
                <Meta
                  description={
                    <>
                      <div><MailOutlined /> Email: contact@example.com</div>
                      <div><PhoneOutlined /> Phone: +123 456 7890</div>
                      <div><EnvironmentOutlined /> Address: 123 Main St, City, Country</div>
                    </>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="Send Us a Message" bordered={false}>
                <Form
                  layout="vertical"
                  onFinish={(values) => {
                    console.log('Received values:', values);
                  }}
                >
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input your name!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Message"
                    name="message"
                    rules={[{ required: true, message: 'Please input your message!' }]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Send
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', padding: '10px 0' }}>Gulf Stock Transportation ©2024</Footer>
    </Layout>
  );
}

export default Contact;
