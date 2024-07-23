import React, { useState } from 'react';
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  CarOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './CustomerSidemenu.css';

const { Sider } = Layout;

const menuItems = [
  {
    key: 'dashboard',
    icon: <PieChartOutlined />,
    label: 'Dashboard',
    link: '/customer/dashboard',
  },
  {
    key: 'book',
    icon: <DesktopOutlined />,
    label: 'Book Vehicle',
    link: '/customer/booking', 
  },
  {
    key: 'booking-history',
    icon: <ContainerOutlined />,
    label: 'Booking History',
    link: '/customer/booking-history', 
  },
  {
    key: 'pickup-view',
    icon: <ContainerOutlined />,
    label: 'Stock Pending Pickup',
    link: '/customer/stock-pickup', 
  },
  {
    key: 'drivers',
    icon: <CarOutlined />,
    label: 'Drivers',
    link: '/customer/drivers', 
  },
  {
    key: 'costcalculator',
    icon: <CalculatorOutlined />,
    label: 'Cost Calculator',
    link: '/customer/cost-calculator',
  },
  {
    key: 'profile-settings',
    icon: <UserOutlined />,
    label: 'Profile Settings',
    link: '/customer/profile-settings',
  },
  {
    key: 'logout',
    icon: <MailOutlined />,
    label: 'Logout',
    link: '/logout',
  },
];

const CustomerSidemenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate(); 

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    
    localStorage.clear();
    navigate('/customer/signin'); 
  };

  const renderMenuItems = (items) =>
    items.map((item) =>
      item.key === 'logout' ? (
        <Menu.Item key={item.key} icon={item.icon} onClick={handleLogout}>
          {item.label}
        </Menu.Item>
      ) : (
        <Menu.Item key={item.key} icon={item.icon}>
          <Link to={item.link}>{item.label}</Link>
        </Menu.Item>
      )
    );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        style={{ backgroundColor: 'white' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '16px 0',
            cursor: 'pointer',
          }}
          onClick={toggleCollapsed}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={collapsed}
          style={{ backgroundColor: 'white', height: '100%' }}
          defaultSelectedKeys={['dashboard']}
        >
          {renderMenuItems(menuItems)}
        </Menu>
      </Sider>
    </Layout>
  );
};

export default CustomerSidemenu;
