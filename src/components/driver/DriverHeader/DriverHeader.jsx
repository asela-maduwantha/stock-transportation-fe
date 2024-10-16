import React, { useState } from "react";
import { Button, Menu, Dropdown } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  //DashboardOutlined,
  ProfileOutlined,
  CarOutlined,
  LockOutlined,
  QuestionCircleOutlined,
  MenuOutlined,
  LogoutOutlined,
  BellOutlined,
  UserOutlined
} from "@ant-design/icons";
import Logo from "../../../assets/Logo.png";
import "./DriverHeader.css";
import Cookies from 'js-cookie'

const DriverHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/driver/signin");

    Cookies.remove('driverUsername');
    Cookies.remove('driverPassword');
  };

  const menuItems = [
    {
      key: "assigned-trips",
      icon: <CarOutlined />,
      label: "Assigned Trips",
      link: "/driver/assigned-trips",
    },
    {
      key: "vehicles",
      icon: <ProfileOutlined />,
      label: "Vehicles",
      link: "/driver/vehicles",
    },
    {
      key: "notification",
      icon: <BellOutlined />,
      label: "Notifications",
      link: "/driver/notification",
    },
    {
      key: 'profile-update',
      icon: <UserOutlined />,
      label: 'Profile Update',
      link: '/driver/profile-update',
    },
    {
      key: 'password-change',
      icon: <LockOutlined />,
      label: 'Password Change',
      link: '/driver/password-change',
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Help",
      link: "/driver/help",
    },
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
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
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
    <header className="driver-header">
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

export default DriverHeader;
