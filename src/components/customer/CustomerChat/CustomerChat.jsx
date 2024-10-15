import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Typography, message } from 'antd';
import { SendOutlined, UserOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import httpService from '../../../services/httpService';

const { Text, Title } = Typography;

const CustomerChat = () => {
  const location = useLocation();
  const { ownerId } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [ownerName, setOwnerName] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const socket = io('https://stocktrans.azurewebsites.net/');
    const storedCustomerId = localStorage.getItem('customerId');
    
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
      loadChatHistory(storedCustomerId);
    } else {
      message.error('Customer ID not found in localStorage');
    }

    socket.on('chat', (data) => {
      const { chatResp } = data;
      setMessages((prevMessages) => [...prevMessages, chatResp]);
    });

    if (ownerId) {
      socket.emit('joinChatRoom', ownerId);
    }

    return () => {
      if (ownerId) {
        socket.emit('leavechatRoom', ownerId);
      }
      socket.disconnect();
    };
  }, [ownerId]);

  useEffect(scrollToBottom, [messages]);

  const loadChatHistory = async (id) => {
    try {
      const response = await httpService.get(`/chat/chatCustomer/${id}`);
      
      if (response.data && response.data.length > 0) {
        const chatData = response.data[0];
        setOwnerName(chatData.ownerName);
        setMessages(chatData.messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      message.error('Failed to load chat history');
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() && ownerId && customerId) {
      try {
        const chatReq = {
          ownerId,
          customerId,
          role: 'customer',
          message: inputMessage
        };
        await httpService.post('/chat/chat', chatReq);
        setInputMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        message.error('Failed to send message');
      }
    } else {
      message.error('Please enter a message and ensure customer ID is available');
    }
  };

  return (
    <Card 
      style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        padding: 0,
        borderRadius: 0
      }}
      bodyStyle={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '16px'
      }}
    >
      <Title level={4} style={{ marginBottom: '16px' }}>
        Chat with {ownerName || 'Support'}
      </Title>
      <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '16px' }}>
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item style={{ 
              justifyContent: msg.role === 'customer' ? 'flex-end' : 'flex-start',
              padding: '4px 0'
            }}>
              <Card 
                style={{ 
                  maxWidth: '70%', 
                  backgroundColor: msg.role === 'customer' ? '#e6f7ff' : '#f0f0f0',
                  borderRadius: '12px',
                  padding: '8px 12px'
                }}
                bodyStyle={{ padding: '0' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  {msg.role === 'customer' ? 
                    <UserOutlined style={{ marginRight: '8px' }} /> : 
                    <CustomerServiceOutlined style={{ marginRight: '8px' }} />
                  }
                  <Text strong>{msg.role === 'customer' ? 'You' : ownerName || 'Support'}</Text>
                </div>
                <Text>{msg.message}</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(msg.timeStamp).toLocaleTimeString()}
                  </Text>
                </div>
              </Card>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', position: 'sticky', bottom: 0, backgroundColor: '#fff', padding: '16px 0' }}>
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onPressEnter={sendMessage}
          placeholder="Type a message"
          style={{ flexGrow: 1, marginRight: '8px' }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={sendMessage}>
          Send
        </Button>
      </div>
    </Card>
  );
};

export default CustomerChat;