import React, { useState, useEffect, useCallback } from 'react';
import { LockOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Button, Input, message, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import httpService from '../../../services/httpService';
import CustomerImg from '../../../assets/images/ownersignin.jpg';

const PasswordRequirementItem = ({ met, text }) => (
  <div style={{ color: met ? '#52c41a' : '#ff4d4f', marginBottom: '4px' }}>
    {met ? <CheckCircleFilled /> : <CloseCircleFilled />}
    <span style={{ marginLeft: '8px' }}>{text}</span>
  </div>
);

PasswordRequirementItem.propTypes = {
  met: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
};

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

const CustomerPasswordChange = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '#ff4d4f'
  });
  const navigate = useNavigate();
  const isMobile = useScreenSize();
  const customerId = localStorage.getItem('customerId');

  const checkPasswordStrength = (password) => {
    let score = 0;
    let checks = {
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score += checks.length ? 20 : 0;
    score += checks.hasUpperCase ? 20 : 0;
    score += checks.hasLowerCase ? 20 : 0;
    score += checks.hasNumbers ? 20 : 0;
    score += checks.hasSpecialChar ? 20 : 0;

    let strengthInfo = {
      score,
      message: 'Weak',
      color: '#ff4d4f'
    };

    if (score > 60) {
      strengthInfo.message = 'Strong';
      strengthInfo.color = '#52c41a';
    } else if (score > 30) {
      strengthInfo.message = 'Good';
      strengthInfo.color = '#faad14';
    }

    return strengthInfo;
  };

  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
  };

  const validateNewPassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    return Object.values(requirements).every(req => req);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      message.error('Please fill in both fields.');
      return;
    }

    if (!validateNewPassword(newPassword)) {
      message.error('New password does not meet the requirements.');
      return;
    }

    try {
      await httpService.put(`/customer/password/${customerId}`, { oldPassword, newPassword });
      message.success('Password changed successfully!');
      navigate('/customer/dashboard');
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
            src={CustomerImg}
            alt="Customer Change Password"
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
            onChange={handleNewPasswordChange}
          />
          
          <div style={{ marginBottom: '16px' }}>
            <Progress
              percent={passwordStrength.score}
              status="active"
              strokeColor={passwordStrength.color}
              format={() => passwordStrength.message}
            />
            <div style={{ marginTop: '8px' }}>
              <PasswordRequirementItem
                met={newPassword.length >= 8}
                text="At least 8 characters"
              />
              <PasswordRequirementItem
                met={/[A-Z]/.test(newPassword)}
                text="At least one uppercase letter"
              />
              <PasswordRequirementItem
                met={/[0-9]/.test(newPassword)}
                text="At least one number"
              />
              <PasswordRequirementItem
                met={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)}
                text="At least one special character"
              />
            </div>
          </div>

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

export default CustomerPasswordChange;