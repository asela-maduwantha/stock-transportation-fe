import React from 'react';
import { Layout, Typography, Collapse, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const TermsConditions = () => {
  const sections = [
    {
      title: "1. Introduction",
      content: "By accessing this application, we will assume you have read, understood, and accepted these terms and conditions. Do not continue using the application if you do not agree to all terms and conditions stated on this page."
    },
    {
      title: "2. User Accounts",
      content: [
        "Registration: The application requires registration and subsequent creation of an account. During registration, the owners and customers shall provide the right and full information.",
        "Authentication: There are adequate mechanisms for authentication in place: secure password storage and encrypted communication.",
        "Profile Management: Users will have the ability to update information in their profiles and will be responsible for maintaining the confidentiality of account details."
      ]
    },
    {
      title: "3. Service Usage",
      content: [
        "Booking and Payment: The customer can use this application to book a vehicle, and they have to make the complete payment online. If a customer cancels their booking, then 90% of the amount will be refunded. The system and the owner will retain 7% and 3% respectively of the total amount.",
        "Vehicle Details: A vehicle owner must provide authentic details pertaining to the vehicle, that is, capacity, preferred areas of transport, and information about the driver in case of hiring.",
        "Cost Estimator: An estimator for cost computation by the user about the transportation by giving the type of vehicle and the distance to the destination is available on the application."
      ]
    },
    {
      title: "4. Cancellation and Refund Policy",
      content: [
        "Customer Cancellation: In case the customer cancels the service, then 90% of the amount paid will be returned to the customer. The remaining 10% will be shared as described above.",
        "Refund Process: Refunds are made within a stipulated amount of time from the date of cancellation request, directly after verification and approval by us."
      ]
    },
    {
      title: "5. Communication and Notifications",
      content: [
        "Notifications: Customers and vehicle owners will get email and in-account notifications regarding their respective bookings, etc.",
        "Chat Box: All the extra information or clarification can be sought directly by the customer through a feature of a chat box to a vehicle owner."
      ]
    },
    {
      title: "6. GPS Tracking and Privacy",
      content: [
        "Tracking: Through this GPS tracking facility, customers can trace the location of their goods. The tracking automatically stops when the driver marks the delivery as complete.",
        "Privacy: User privacy will be taken care of by our company by giving assurance that personal data will be handled safely, and in a manner respectively connecting with pertinent privacy laws."
      ]
    },
    {
      title: "7. Rewards and Discounts",
      content: [
        "Incentives: Those vehicle owners who complete a minimum of 20 hires in a month will be allowed 5% of the earnings. Customers who book 10 vehicles in any three-month period will receive a discount of 5% on the next hire.",
        "Discount Portal: Vehicle owners can choose to offer return trips at a price lower than the original, and customers can book them at a lower cost by 20%, thus properly utilizing the available transport."
      ]
    },
    {
      title: "8. User Responsibilities",
      content: [
        "The user shall use the application in compliance with all applicable laws and regulations.",
        "Users are responsible for checking the accuracy of information furnished. Fraudulent or other illegal activities are not permitted."
      ]
    },
    {
      title: "9. Limitation of Liability",
      content: [
        "The application developers and administrators cannot be held liable for any direct, indirect, incidental, or consequential damages arising from the use of the application.",
        "The application is provided on an \"as is\" basis, and we make no warranties, either express or implied."
      ]
    },
    {
      title: "10. Amendments",
      content: "All terms are subject to our ability to make changes or amendments. Any changes of consequence will result in notifications being published to clients; these notifications are generally posted via a banner at the top of the App further explaining the nature of the change. Further, it is hereby agreed by the parties that through use of the application, said actions on behalf of users constitute acceptance of any changes put into effect."
    },
    {
      title: "11. Contact Information",
      content: "Users are allowed to ask and clarify any questions or doubts regarding these terms and conditions through email addresses or contact numbers provided where deem necessary."
    }
  ];

  return (
    <Layout>
      <Content style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ color: '#fdb940', textAlign: 'center' }}>
            <FileTextOutlined /> Terms and Conditions
          </Title>
          <Paragraph>
            <Text strong>
              The terms and conditions are seeking a smooth operation justly using the stock transportation
              system with integrity on both parties concerned.
            </Text>
          </Paragraph>
          <Collapse accordion>
            {sections.map((section, index) => (
              <Panel header={section.title} key={index}>
                {Array.isArray(section.content) ? (
                  <ul>
                    {section.content.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <Paragraph>{section.content}</Paragraph>
                )}
              </Panel>
            ))}
          </Collapse>
        </Space>
      </Content>
    </Layout>
  );
};

export default TermsConditions;