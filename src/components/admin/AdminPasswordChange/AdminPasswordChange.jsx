import React, { useState, useEffect, useCallback } from 'react';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Input, Button, message, Layout, Typography, Card, Row, Col } from 'antd';
import httpService from '../../../services/httpService';
import adminImg from '../../../assets/images/ownersignin.jpg'

const { Content } = Layout;
const { Title } = Typography;

// Hook to check screen size for responsiveness
const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  return isMobile;
};

const AdminPasswordChange = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const isMobile = useScreenSize();
  const adminId = localStorage.getItem('adminId');

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      message.error('Please fill in both fields.');
      return;
    }
    try {
        await httpService.put(`/admin/password/${adminId}`, { oldPassword, newPassword });
      message.success('Password changed successfully!');
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password. Please try again.');
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="flex justify-center items-center">
        <Card 
          className="w-11/12 max-w-4xl"
          bodyStyle={{ padding: 0 }}
        >
          <Row gutter={0}>
            {!isMobile && (
              <Col span={12}>
                <div className="h-full flex items-center justify-center p-5">
                  <img
                    src= {adminImg}
                    alt="Admin Change Password"
                    className="max-w-full h-auto object-cover rounded-lg"
                  />
                </div>
              </Col>
            )}
            <Col span={isMobile ? 24 : 12}>
              <div className="p-8">
                <Title level={2} className="text-center mb-6 text-orange-400">
                  Change Password
                </Title>
                <Input
                  prefix={<LockOutlined className="text-gray-400" />}
                  type="password"
                  placeholder="Old Password"
                  className="mb-4"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <Input
                  prefix={<LockOutlined className="text-gray-400" />}
                  type="password"
                  placeholder="New Password"
                  className="mb-4"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="primary"
                  className="w-full bg-orange-400 hover:bg-orange-500 border-orange-400 hover:border-orange-500"
                  onClick={handleChangePassword}
                >
                  Change Password
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminPasswordChange;