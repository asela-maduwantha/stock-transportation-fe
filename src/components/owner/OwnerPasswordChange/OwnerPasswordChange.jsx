import React, { useState, useEffect, useCallback } from 'react';
import { LockOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';
import OwnerImg from '../../../assets/images/ownersignin.jpg';

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

const OwnerPasswordChange = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const isMobile = useScreenSize();
  const ownerId = localStorage.getItem('ownerId');

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      message.error('Please fill in both fields.');
      return;
    }

    try {
      await httpService.put(`/owner/password/${ownerId}`, { oldPassword, newPassword });
      message.success('Password changed successfully!');
      navigate('/owner/dashboard');
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password. Please try again.');
    }
  };

  // Styles
  const containerStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '90vh',
    backgroundColor: '#f0f2f5',
  };

  const formContainerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '90%',
    maxWidth: '80%',
    minHeight: '60vh',
  };

  const imageContainerStyle = {
    flex: '1',
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const imageStyle = {
    maxWidth: '100%',
    height: '90%',
    objectFit: 'cover',
    borderRadius: '8px',
  };

  const formStyle = {
    flex: '0.5',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#fdb940',
  };

  const inputStyle = {
    marginBottom: '16px',
  };

  const iconStyle = {
    color: 'rgba(0, 0, 0, 0.25)',
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#fdb940',
    borderColor: '#fdb940',
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={imageContainerStyle}>
          <img
            src={OwnerImg}
            alt="Owner Change Password"
            style={imageStyle}
          />
        </div>
        <div style={formStyle}>
          <h1 style={titleStyle}>Change Password</h1>
          <Input.Password
            prefix={<LockOutlined style={iconStyle} />}
            placeholder="Old Password"
            size="large"
            style={inputStyle}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input.Password
            prefix={<LockOutlined style={iconStyle} />}
            placeholder="New Password"
            size="large"
            style={inputStyle}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button
            type="primary"
            size="large"
            style={buttonStyle}
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerPasswordChange;
