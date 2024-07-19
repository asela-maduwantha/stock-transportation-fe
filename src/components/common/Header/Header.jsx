// Header.js
import React, { useState, useEffect } from 'react';
import { Button, Select } from 'antd';
import Logo from '../../../assets/Logo.png';
import './Header.css';
import { Link } from "react-router-dom";

const { Option } = Select;

const Header = () => {
  const [selectedOption, setSelectedOption] = useState('vehicle-owner');

  useEffect(() => {
    const savedOption = localStorage.getItem('selectedOption');
    if (savedOption) {
      setSelectedOption(savedOption);
    }
  }, []);

  const handleOptionChange = (value) => {
    setSelectedOption(value);
    localStorage.setItem('selectedOption', value);
  };

  const handleSignIn = () => {
    switch (selectedOption) {
      case 'vehicle-owner':
        window.location.href = '/owner/signin';
        break;
      case 'customer':
        window.location.href = '/customer/signin';
        break;
      default:
        break;
    }
  };

  return (
    <div className="header">
      <div className="logo">
       <Link to='/'> <img src={Logo} alt="Logo" /></Link>
      </div>
      <nav className="navigation">
        <ul>
          <li><Link to="/vehicle-owner/reg">Vehicle Owner</Link></li>
          <li><Link to="/customer/reg">Customer</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          <li><Link to="/about">About Us</Link></li>
        </ul>
      </nav>
      <div className="signin-container">
        <Select 
          value={selectedOption}
          onChange={handleOptionChange} 
          style={{ marginRight: '10px' }}
        >
          <Option value="vehicle-owner">Vehicle Owner</Option>
          <Option value="customer">Customer</Option>
          <Option value="driver">Driver</Option>
        </Select>
        <Button 
          type="primary" 
          onClick={handleSignIn} 
          style={{ width: '100px', height:'40px', backgroundColor:'#fdb940', color:'#ffff', fontSize:'15px', fontWeight:'normal' }}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default Header;
