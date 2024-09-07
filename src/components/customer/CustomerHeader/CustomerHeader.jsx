import React, { useState } from "react";
import { Button, Menu, Dropdown } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  UserOutlined,
  CalculatorOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Logo from "../../../assets/Logo.png";
import "./CustomerHeader.css";

const CustomerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/customer/signin");
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <PieChartOutlined />,
      label: "Dashboard",
      link: "/customer/dashboard",
    },
    {
      key: "book",
      icon: <DesktopOutlined />,
      label: "Book Vehicle",
      link: "/customer/booking",
    },
    {
      key: "shared-booking",
      icon: <ContainerOutlined />,
      label: "Shared- Bookings",
      link: "/customer/shared-booking",
    },
    {
      key: "booking-history",
      icon: <ContainerOutlined />,
      label: "Booking History",
      link: "/customer/booking-history",
    },
    {
      key: "pickup-view",
      icon: <ContainerOutlined />,
      label: "Stock Pending Pickup",
      link: "/customer/stock-pickup",
    },
    {
      key: "costcalculator",
      icon: <CalculatorOutlined />,
      label: "Cost Calculator",
      link: "/customer/cost-calculator",
    },
    {
      key: "profile-settings",
      icon: <UserOutlined />,
      label: "Profile Settings",
      link: "/customer/profile-settings",
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