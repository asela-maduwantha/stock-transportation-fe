import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Avatar, Typography, Badge, message } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const { Text } = Typography;

const OwnerChat = () => {
  const [chatData, setChatData] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const storedOwnerId = localStorage.getItem('ownerId');
    if (storedOwnerId) {
      setOwnerId(storedOwnerId);
      fetchChatHistory(storedOwnerId);
    } else {
      message.error('Owner data missing. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeCustomer]);

  const fetchChatHistory = async (ownerId) => {
    try {
      const response = await httpService.get(`/chat/chatOwner/${ownerId}`);
      setChatData(response.data);
      
      if (response.data.length > 0) {
        setActiveCustomer(response.data[0]);
      }
    } catch (error) {
      message.error('Failed to fetch chat history');
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() && activeCustomer && ownerId) {
      const chatReq = {
        ownerId: ownerId,
        customerId: activeCustomer.customerId,
        role: 'owner',
        message: inputMessage,
        timeStamp: new Date().toISOString(),
      };
  
      try {
        const response = await httpService.post('/chat/chat', chatReq);
        if (response.status === 200) {
          setChatData(prevData => 
            prevData.map(customer => 
              customer.customerId === activeCustomer.customerId
                ? { ...customer, messages: [...customer.messages, chatReq] }
                : customer
            )
          );
          setInputMessage('');
          message.success('Message sent successfully');
        } else {
          message.error('Failed to send message');
        }
      } catch (error) {
        message.error('Error sending message');
        console.error('Error while sending message:', error);
      }
    } else if (!ownerId) {
      message.error('Owner ID not available');
    } else if (!activeCustomer) {
      message.error('Please select a customer to chat with');
    }
  };

  const handleCustomerSelect = (customer) => {
    setActiveCustomer(customer);
  };

  const getUnreadCount = (customer) => {
    return customer.messages.filter(m => m.role === 'customer').length;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '20px' }}>
      <Card style={{ width: '30%', marginRight: '20px', overflowY: 'auto' }}>
        <List
          dataSource={chatData}
          renderItem={(customer) => (
            <List.Item
              onClick={() => handleCustomerSelect(customer)}
              style={{
                cursor: 'pointer',
                backgroundColor: activeCustomer?.customerId === customer.customerId ? '#e6f7ff' : 'white',
              }}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Badge count={getUnreadCount(customer)} size="small">
                    <span>{customer.customerName}</span>
                  </Badge>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
        <div ref={chatContainerRef} style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px', height: 'calc(100vh - 180px)' }}>
          {activeCustomer && (
            <List
              dataSource={activeCustomer.messages}
              renderItem={(message) => (
                <List.Item style={{ justifyContent: message.role === 'owner' ? 'flex-end' : 'flex-start' }}>
                  <Card style={{ maxWidth: '70%', backgroundColor: message.role === 'owner' ? '#e6f7ff' : '#f0f0f0' }}>
                    <Text>{message.message}</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(message.timeStamp).toLocaleTimeString()}
                      </Text>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>

        <div style={{ display: 'flex', position: 'sticky', bottom: 0, backgroundColor: 'white', padding: '10px 0' }}>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onPressEnter={sendMessage}
            placeholder="Type a message"
            style={{ flexGrow: 1, marginRight: '10px' }}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={sendMessage}>
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OwnerChat;