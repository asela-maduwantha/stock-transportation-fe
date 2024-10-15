import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { List, Typography, Button, Space, Pagination, message } from 'antd';
import { CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import io from 'socket.io-client';
import httpService from '../../../services/httpService';

const { Text, Title } = Typography;

const Notification = ({ userType }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of notifications per page

  const getUserId = useCallback(() => {
    switch (userType) {
      case 'customer':
        return localStorage.getItem('customerId');
      case 'owner':
        return localStorage.getItem('ownerId');
      case 'driver':
        return localStorage.getItem('driverId');
      default:
        return null;
    }
  }, [userType]);

  const fetchNotifications = useCallback(async (userId) => {
    try {
      const response = await httpService.get(`/${userType}/notification/${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to fetch notifications');
    }
  }, [userType]);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      message.error(`${userType} ID not found in local storage`);
      return;
    }

    // Fetch initial notifications
    fetchNotifications(userId);

    // Set up WebSocket connection
    const newSocket = io('https://stocktrans.azurewebsites.net/');
    setSocket(newSocket);
   
    newSocket.on('connect', () => {
      newSocket.emit(`join${userType.charAt(0).toUpperCase() + userType.slice(1)}NotifyRoom`, userId);
    });

    newSocket.on('notification', (data) => {
      setNotifications(prev => [data.request, ...prev]);
    });

    return () => {
      newSocket.emit(`leave${userType.charAt(0).toUpperCase() + userType.slice(1)}NotifyRoom`, userId);
      newSocket.close();
    };
  }, [userType, fetchNotifications, getUserId]);

  const handleMarkAsRead = useCallback((id) => {
    if (socket) {
      socket.emit('markAsRead', { userType, id });
      setNotifications(prevNotifications =>
        prevNotifications.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } else {
      console.error('Socket connection not established');
    }
  }, [socket, userType]);

  const handleMarkAllAsRead = useCallback(() => {
    if (socket) {
      socket.emit('markAllAsRead', { userType });
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
    } else {
      console.error('Socket connection not established');
    }
  }, [socket, userType]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={4}>{`${userType.charAt(0).toUpperCase() + userType.slice(1)} Notifications`}</Title>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        </Space>

        <List
          itemLayout="horizontal"
          dataSource={paginatedNotifications}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{
                backgroundColor: item.read ? '#f0f2f5' : '#e6f7ff',
                padding: '12px 16px',
                marginBottom: 8,
                borderRadius: 4,
              }}
              actions={[
                <Button
                  key={`mark-read-${item.id}`}
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleMarkAsRead(item.id)}
                  style={{ color: item.read ? '#bfbfbf' : '#1890ff' }}
                >
                  Mark as Read
                </Button>
              ]}
            >
              <List.Item.Meta
                title={<Text strong={!item.read}>{item.title}</Text>}
                description={
                  <>
                    <Text>{item.message}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(item.timeStamp).toLocaleString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />

        <Pagination
          current={currentPage}
          total={notifications.length}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          style={{ textAlign: 'center' }}
        />
      </Space>
    </div>
  );
};

Notification.propTypes = {
  userType: PropTypes.oneOf(['owner', 'driver', 'customer']).isRequired,
};

const OwnerNotification = () => <Notification userType="owner" />;
const DriverNotification = () => <Notification userType="driver" />;
const CustomerNotification = () => <Notification userType="customer" />;

export { OwnerNotification, DriverNotification, CustomerNotification };