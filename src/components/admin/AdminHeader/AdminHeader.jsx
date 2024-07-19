import React from 'react';
import { Button } from 'antd';
import Logo from '../../../assets/Logo.png';
import './AdminHeader.css'


const AdminHeader = () => {
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
          href='/'
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
