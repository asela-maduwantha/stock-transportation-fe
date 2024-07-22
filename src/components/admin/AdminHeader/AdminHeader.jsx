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
          style={{ width: '100px', height:'40px', backgroundColor:'#fdb940', color:'#ffff', fontSize:'15px', fontWeight:'normal' }}
          onClick={handleLogout} 
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
