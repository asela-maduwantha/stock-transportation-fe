import React, { useState } from "react";
import { Button, Menu, Dropdown } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  CarOutlined,
  CarFilled,
  ShareAltOutlined,
  HistoryOutlined,
  SettingOutlined,
  MenuOutlined,
  UserSwitchOutlined,
  GiftOutlined,
  BellOutlined,
} from "@ant-design/icons";
import Logo from "../../../assets/Logo.png";
import "./CustomerHeader.css";
import Cookies from 'js-cookie';

const CustomerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage
    localStorage.clear();
    
    // Remove cookies related to the user session
    Cookies.remove('customerUsername');
    Cookies.remove('customerPassword');
    
    // Navigate to the home page after logout
    navigate("/");
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      link: "/customer/dashboard",
    },
    {
      key: "book",
      icon: <CarOutlined />,
      label: "Book Vehicle",
      link: "/customer/booking",
    },
    {
      key: "shared-booking",
      icon: <CarFilled />,
      label: "Make Shared Booking",
      link: "/customer/shared-booking",
    },
    {
      key: "booking-history",
      icon: <HistoryOutlined />,
      label: "Booking History",
      link: "/customer/booking-history",
    },
    {
      key: "sharedbookinghistory",
      icon: <ShareAltOutlined />,
      label: "Shared Booking History",
      link: "/customer/shared-booking-history",
    },
    {
      key: "rewardlist",
      icon: <GiftOutlined />,
      label: "Rewards",
      link: "/customer/reward-list",
    },
    {
      key: "notification",
      icon: <BellOutlined />,
      label: "Notifications",
      link: "/customer/notification",
    },
    {
      key: 'profile-update',
      icon: <UserSwitchOutlined />,
      label: 'Profile Update',
      link: '/customer/profile-update',
    },
    {
      key: 'password-change',
      icon: <SettingOutlined />,
      label: 'Password Change',
      link: '/customer/password-change',
    }
  ];

  const renderMenuItems = () =>
    menuItems.map((item) => (
      <Menu.Item key={item.key} icon={item.icon}>
        <Link to={item.link}>{item.label}</Link>
      </Menu.Item>
    ));

  const mobileMenu = (
    <Menu>
      {renderMenuItems()}
      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const logoutButtonStyle = {
    width: "100px",
    height: "40px",
    backgroundColor: isHovered ? "#fdb940" : "#fdb940",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "normal",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease, opacity 0.3s ease",
    opacity: isHovered ? "0.8" : "1",
  };

  return (
    <header className="customer-header">
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="logo" />
      </div>
      <nav className="main-nav">
        <Menu mode="horizontal" className="desktop-menu">
          {renderMenuItems()}
        </Menu>
      </nav>
      <div className="actions">
        <Button
          type="primary"
          onClick={handleLogout}
          className="logout-btn desktop-only"
          style={logoutButtonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Logout
        </Button>
        <Dropdown
          overlay={mobileMenu}
          trigger={["click"]}
          visible={isMenuOpen}
          onVisibleChange={setIsMenuOpen}
        >
          <Button icon={<MenuOutlined />} className="mobile-menu-toggle" />
        </Dropdown>
      </div>
    </header>
  );
};

export default CustomerHeader;
