import React from 'react';
import { Button } from 'antd';
import Logo from '../../../assets/Logo.png';
import './AdminHeader.css';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/'); 
  };

  return (
    <div className="admin-header">
      <div className="logo">
        <img src={Logo} alt="Logo" /> 
      </div>
      <div className='space'></div>
      <div className="logout-container">
        <Button 
          type="primary" 
          className="logout-btn"
          onClick={handleLogout} 
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
