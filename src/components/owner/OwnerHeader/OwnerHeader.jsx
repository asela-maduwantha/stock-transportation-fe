import React, { useState } from "react";
import { Button, Menu, Dropdown } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  UserAddOutlined,
  IdcardOutlined,
  CarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  WalletOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import Logo from "../../../assets/Logo.png";


const OwnerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/owner/signin");
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      link: '/owner/dashboard',
    },
    {
      key: 'add-driver',
      icon: <UserAddOutlined />,
      label: 'Add Driver',
      link: '/owner/add-driver',
    },
    {
      key: 'my-drivers',
      icon: <IdcardOutlined />,
      label: 'My Drivers',
      link: '/owner/drivers',
    },
    {
      key: 'add-vehicle',
      icon: <CarOutlined />,
      label: 'Add Vehicle',
      link: '/owner/add-vehicle',
    },
    {
      key: 'view-vehicle',
      icon: <CarOutlined />,
      label: 'My Vehicles',
      link: '/owner/vehicles',
    },
    {
      key: 'my-bookings',
      icon: <CarOutlined />,
      label: 'My Bookings',
      link: '/owner/my-bookings',
    },
    {
      key: 'wallet',
      icon: <WalletOutlined />,
      label: 'Wallet',
      link: '/owner/wallet',
    },
    {
      key: 'profile-update',
      icon: <UserSwitchOutlined />,
      label: 'Profile Update',
      link: '/owner/profile-update',
    },
    {
      key: 'password-change',
      icon: <SettingOutlined />,
      label: 'Password Change',
      link: '/owner/password-change',
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

export default OwnerHeader;
