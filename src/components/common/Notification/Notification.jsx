import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { List, Typography, Button, Space, Pagination } from 'antd';
import { CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import io from 'socket.io-client';

const { Text, Title } = Typography;

const Notification = ({ userType }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of notifications per page

  useEffect(() => {
    const newSocket = io('http://your-backend-url');
    setSocket(newSocket);
    newSocket.on(`${userType}_notification`, (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
    return () => newSocket.close();
  }, [userType]);

  const handleMarkAsRead = (id) => {
    socket.emit('mark_as_read', { userType, id });
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    socket.emit('mark_all_as_read', { userType });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

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
                title={<Text strong={!item.read}>{item.message}</Text>}
                description={
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
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
  userType: PropTypes.string.isRequired,
};

const OwnerNotification = () => <Notification userType="owner" />;
const DriverNotification = () => <Notification userType="driver" />;
const CustomerNotification = () => <Notification userType="customer" />;

export { OwnerNotification, DriverNotification, CustomerNotification };