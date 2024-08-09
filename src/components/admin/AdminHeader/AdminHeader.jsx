import React, { useState } from 'react';
import { Button, Row, Col } from 'antd';
import Logo from '../../../assets/Logo.png';
import './AdminHeader.css';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const logoutButtonStyle = {
    width: '100px',
    height: '40px',
    backgroundColor: isHovered ? '#fdb940' : '#fdb940',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 'normal',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, opacity 0.3s ease',
    opacity: isHovered ? '0.8' : '1',
  };

  return (
    <div className="admin-header">
      <Row align="middle" justify="space-between" gutter={16}>
        <Col>
          <img src={Logo} alt="Logo" className="logo" /> 
        </Col>
        <Col>
          <Button 
            type="primary" 
            className="logout-btn"
            style={logoutButtonStyle}
            onClick={handleLogout}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Logout
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default AdminHeader;
