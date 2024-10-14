import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Card, Input, Button, List, Avatar, Typography, Badge, message } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const OwnerChat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    // Initialize the socket connection (replace with your server URL)
    const newSocket = io('http://localhost:3000'); // Replace with your server's URL
    setSocket(newSocket);

    // Retrieve ownerId from localStorage
    const storedOwnerId = localStorage.getItem('ownerId');
    if (storedOwnerId) {
      setOwnerId(storedOwnerId);
    } else {
      message.error('Owner ID not found in localStorage');
    }

    // Fetch customers (mock data for now, replace with API call)
    const fetchCustomers = async () => {
      try {
        // Placeholder for API call
        setCustomers([{ id: 'customer1', name: 'Customer 1' }, { id: 'customer2', name: 'Customer 2' }]);
      } catch (error) {
        message.error('Failed to fetch customers');
      }
    };
    fetchCustomers();

    // Socket event listeners
    newSocket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      if (message.sender !== activeCustomer?.id) {
        setUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [message.sender]: (prevCounts[message.sender] || 0) + 1,
        }));
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [activeCustomer]);

  const sendMessage = () => {
    if (inputMessage.trim() && activeCustomer && ownerId) {
      const message = {
        text: inputMessage,
        sender: ownerId,
        receiver: activeCustomer.id,
        timestamp: new Date().toISOString(),
      };
      socket.emit('sendMessage', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setInputMessage('');
    } else if (!ownerId) {
      message.error('Owner ID not available');
    } else if (!activeCustomer) {
      message.error('Please select a customer to chat with');
    }
  };

  const handleCustomerSelect = (customer) => {
    setActiveCustomer(customer);
    setUnreadCounts((prevCounts) => ({ ...prevCounts, [customer.id]: 0 }));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '20px' }}>
      <Card style={{ width: '30%', marginRight: '20px', overflowY: 'auto' }}>
        <List
          dataSource={customers}
          renderItem={(customer) => (
            <List.Item
              onClick={() => handleCustomerSelect(customer)}
              style={{
                cursor: 'pointer',
                backgroundColor: activeCustomer?.id === customer.id ? '#e6f7ff' : 'white',
              }}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Badge count={unreadCounts[customer.id] || 0} size="small">
                    <span>{customer.name}</span>
                  </Badge>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px' }}>
          <List
            dataSource={messages.filter(
              (m) => m.sender === activeCustomer?.id || m.receiver === activeCustomer?.id
            )}
            renderItem={(message) => (
              <List.Item style={{ justifyContent: message.sender === ownerId ? 'flex-end' : 'flex-start' }}>
                <Card style={{ maxWidth: '70%', backgroundColor: message.sender === ownerId ? '#e6f7ff' : '#f0f0f0' }}>
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

export default OwnerChat;
