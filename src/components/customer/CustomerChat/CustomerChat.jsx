import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Card, Input, Button, List, Avatar, Typography, message } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CustomerChat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeOwner, setActiveOwner] = useState(null);
  const [owners, setOwners] = useState([]);
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    // Initialize the socket connection (replace with your server URL)
    const newSocket = io('http://localhost:3000'); // Replace with your server's URL
    setSocket(newSocket);

    // Retrieve customerId from localStorage
    const storedCustomerId = localStorage.getItem('customerId');
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
    } else {
      message.error('Customer ID not found in localStorage');
    }

    // Fetch owners (mock data for now, replace with actual API call)
    const fetchOwners = async () => {
      try {
        // Mock API response
        setOwners([{ id: 'owner1', name: 'Owner 1' }, { id: 'owner2', name: 'Owner 2' }]);
      } catch (error) {
        message.error('Failed to fetch owners');
      }
    };
    fetchOwners();

    // Socket event listener for receiving messages
    newSocket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup socket connection when component is unmounted
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() && activeOwner && customerId) {
      const message = {
        text: inputMessage,
        sender: customerId,
        receiver: activeOwner.id,
        timestamp: new Date().toISOString(),
      };
      socket.emit('sendMessage', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setInputMessage('');
    } else if (!customerId) {
      message.error('Customer ID not available');
    } else if (!activeOwner) {
      message.error('Please select an owner to chat with');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '20px' }}>
      <Card style={{ width: '30%', marginRight: '20px', overflowY: 'auto' }}>
        <List
          dataSource={owners}
          renderItem={(owner) => (
            <List.Item
              onClick={() => setActiveOwner(owner)}
              style={{ cursor: 'pointer', backgroundColor: activeOwner?.id === owner.id ? '#e6f7ff' : 'white' }}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={owner.name}
              />
            </List.Item>
          )}
        />
      </Card>
      
      <Card style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px' }}>
          <List
            dataSource={messages.filter(m => m.sender === activeOwner?.id || m.receiver === activeOwner?.id)}
            renderItem={(message) => (
              <List.Item style={{ justifyContent: message.sender === customerId ? 'flex-end' : 'flex-start' }}>
                <Card style={{ maxWidth: '70%', backgroundColor: message.sender === customerId ? '#e6f7ff' : '#f0f0f0' }}>
                  <Text>{message.text}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Text>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>

        <div style={{ display: 'flex' }}>
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

export default CustomerChat;
