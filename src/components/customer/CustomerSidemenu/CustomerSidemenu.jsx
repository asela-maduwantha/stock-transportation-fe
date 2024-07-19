import React, { useState } from 'react';
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { Link } from 'react-router-dom';
import './CustomerSidemenu.css';

const { Sider } = Layout;


const menuItems = [
  {
    key: 'dashboard',
    icon: <PieChartOutlined />,
    label: 'Dashboard',
    link: 'dashboard',
  },
  {
    key: 'book',
    icon: <DesktopOutlined />,
    label: 'Book Vehicle',
    link: 'booking', 
  },
  {
    key: 'booking-history',
    icon: <ContainerOutlined />,
    label: 'Booking History',
    link: 'booking-history', 
  },
  {
    key: 'pickup-view',
    icon: <ContainerOutlined />,
    label: 'Stock pending Pickup',
    link: 'stock-pickup', 
  },
  {
    key: 'drivers',
    icon: <ContainerOutlined />,
    label: 'Drivers',
    link: 'drivers', 
  },
  {
    key: 'costcalculator',
    icon: <ContainerOutlined />,
    label: 'Cost Calculator',
    link: 'cost-calculator',
  },
  {
    key: 'profile-settings',
    icon: <UserOutlined />,
    label: 'Profile Settings',
    link: 'profile-settings',
  },
  {
    key: 'logout',
    icon: <MailOutlined />,
    label: 'Logout',
    link: 'logout',
  },
];

const CustomerSidemenu = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const renderMenuItems = (items) =>
    items.map((item) => (
      <Menu.Item key={item.key} icon={item.icon}>
        <Link to={item.link}>{item.label}</Link>
      </Menu.Item>
    ));

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
