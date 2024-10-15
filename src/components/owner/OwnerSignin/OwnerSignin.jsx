import React, { useState, useEffect, useCallback } from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, message, Checkbox } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import httpService from '../../../services/httpService';
import OwnerImg from '../../../assets/images/ownersignin.jpg';
import Cookies from 'js-cookie';

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

const OwnerSignin = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const isMobile = useScreenSize();

  const handleSignIn = useCallback(async (username, pass) => {
    if (!username || !pass) {
      message.error('Please provide both username and password.');
      return;
    }

    try {
      const response = await httpService.post('/owner/signin', { userName: username, password: pass });
      const { id } = response.data;
      localStorage.setItem('ownerId', id);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('userRole', 'owner');

      if (rememberMe) {
        Cookies.set('ownerUsername', username, { expires: 30 });
        Cookies.set('ownerPassword', pass, { expires: 30 });
      } else {
        Cookies.remove('ownerUsername');
        Cookies.remove('ownerPassword');
      }

      message.success('Sign-in successful!');
      navigate('/owner/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      message.error('Failed to sign in. Please check your credentials and try again.');
    }
  }, [navigate, rememberMe]);

  useEffect(() => {
    const savedUsername = Cookies.get('ownerUsername');
    const savedPassword = Cookies.get('ownerPassword');
    if (savedUsername && savedPassword) {
      setUserName(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
      handleSignIn(savedUsername, savedPassword);
    }
  }, [handleSignIn]);

  const onSignInClick = () => handleSignIn(userName, password);

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

  const forgotPasswordLinkStyle = {
    marginTop: '16px',
    textAlign: 'center',
    color: '#fdb940',
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={imageContainerStyle}>
          <img
            src={OwnerImg}
            alt="Owner Signin"
            style={imageStyle}
          />
        </div>
        <div style={formStyle}>
          <h1 style={titleStyle}>Owner Signin</h1>
          <Input
            prefix={<MailOutlined style={iconStyle} />}
            placeholder="Username"
            size="large"
            style={inputStyle}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Input.Password
            prefix={<LockOutlined style={iconStyle} />}
            placeholder="Password"
            size="large"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ marginBottom: '16px' }}
          >
            Remember Me
          </Checkbox>
          <Button
            type="primary"
            size="large"
            style={buttonStyle}
            onClick={onSignInClick}
          >
            Sign In
          </Button>
          <Link to="/owner/forgot-password" style={forgotPasswordLinkStyle}>
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OwnerSignin;