import React, { useState, useEffect, useRef } from 'react';
import { MailOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const OwnerForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(300);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [userId, setUserId] = useState('');
  const timerRef = useRef(null);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsButtonDisabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimer(120);
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [step]);

  const handleEmailSubmit = async () => {
    if (!email) {
      message.error('Please provide your email.');
      return;
    }

    try {
      const response = await httpService.post(`/common/otp/${email}?userType=owner`);
      setUserId(response.data.id);
      message.success('OTP sent to your email.');
      setStep(2);
    } catch (error) {
      console.error('Error sending email:', error);
      message.error('Failed to send OTP. Please try again.');
    }
  };

  const handleOtpChange = (index, e) => {
    const { value } = e.target;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setIsButtonDisabled(newOtp.some((val) => val === ''));

      if (value) {
        if (index < otp.length - 1) {
          inputRefs.current[index + 1].focus();
        }
      } else {
        if (index > 0 && !otp[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    }
  };

  const handleOtpSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length < 4) {
      message.error('Please enter all 4 digits.');
      return;
    }

    try {
      await httpService.post(`/common/verifyOtp/${userId}?userType=owner`, {
      otp: otpString 
      });
      message.success('OTP verified.');
      setStep(3);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      message.error('Failed to verify OTP. Please try again.');
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword) {
      message.error('Please provide your new password.');
      return;
    }

    try {
      await httpService.put(`/common/changePassword/${userId}?userType=owner`, {
        password: newPassword
      });
      message.success('Password reset successful!');
      navigate('/owner/signin');
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error('Failed to reset password. Please try again.');
    }
  };

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
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '90%',
    maxWidth: '400px',
    minHeight: '40vh',
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

  const otpContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
  };

  const otpInputStyle = {
    width: '40px',
    textAlign: 'center',
    marginRight: '8px',
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>Forgot Password</h1>
        {step === 1 && (
          <>
            <Input
              prefix={<MailOutlined style={iconStyle} />}
              placeholder="Email"
              size="large"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="primary"
              size="large"
              style={buttonStyle}
              onClick={handleEmailSubmit}
            >
              Send OTP
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <div style={otpContainerStyle}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  style={otpInputStyle}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e)}
                />
              ))}
            </div>
            <Button
              type="primary"
              size="large"
              style={buttonStyle}
              onClick={handleOtpSubmit}
              disabled={isButtonDisabled}
            >
              Verify OTP
            </Button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              Time remaining: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <Input.Password
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
              onClick={handlePasswordReset}
            >
              Reset Password
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerForgotPassword;