import React, { useState, useEffect } from 'react';
import { Button, Select } from 'antd';
import { Link, useNavigate } from "react-router-dom";
import Logo from '../../../assets/Logo.png';
import './Header.css';

const { Option } = Select;

const Header = () => {
  const [selectedOption, setSelectedOption] = useState('vehicle-owner');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

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
        navigate('/owner/signin');
        break;
      case 'customer':
        navigate('/customer/signin');
        break;
      case 'driver':
        navigate('/driver/signin');
        break;
      default:
        break;
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const signinButtonStyle = {
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
    <header className="header">
      <div className="logo">
        <Link to='/'><img src={Logo} alt="Logo" /></Link>
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={`navigation ${menuOpen ? 'open' : ''}`} style={{paddingLeft:'10%'}}>
        <ul>
        <li><Link to="/home"><strong>Home</strong></Link></li>
          <li><Link to="/vehicle-owner/reg"><strong>Vehicle Owner</strong></Link></li>
          <li><Link to="/customer/reg"><strong>Customer</strong></Link></li>
          <li><Link to="/contact"><strong>Contact Us</strong></Link></li>
          <li><Link to="/about"><strong>About Us</strong></Link></li>
        </ul>
      </nav>
      <div className="signin-container">
        <Select 
          value={selectedOption}
          onChange={handleOptionChange} 
          className="signin-select"
        >
          <Option value="vehicle-owner">Vehicle Owner</Option>
          <Option value="customer">Customer</Option>
          <Option value="driver">Driver</Option>
        </Select>
        <Button 
          type="primary"
          onClick={handleSignIn} 
          className="signin-button"
          style={signinButtonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Sign In
        </Button>
      </div>
    </header>
  );
};

export default Header;
