import React, { useState } from 'react';
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import {Menu, Layout } from 'antd';
import { Link } from 'react-router-dom';
import './AdminSideMenu.css'

const { Sider } = Layout;

// Define the menu items configuration
const menuItems = [
  {
    key: 'dashboard',
    icon: <PieChartOutlined />,
    label: 'Dashboard',
    link: '/dashboard',
  },
  {
    key: 'owner-requests',
    icon: <DesktopOutlined />,
    label: 'Owner Requests',
    link: 'owner-requests',
  },
  {
    key: 'Vehicle Requests',
    icon: <ContainerOutlined />,
    label: 'Vehicle Requests',
    link: 'vehicle-requests',
  },
  {
    key: 'Driver Requests',
    icon: <ContainerOutlined />,
    label: 'Driver Requests',
    link: 'driver-requests',
  },
  {
    key: 'settings',
    icon: <ContainerOutlined />,
    label: 'Settings',
    link: '/settings',
  },
  {
    key: 'logout',
    icon: <MailOutlined />,
    label: 'Logout',
    link: '/logout',
  },
];

const AdminSideMenu = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const renderMenuItems = (items) =>
    items.map(item => (
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
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 0',
          cursor: 'pointer'
        }}
          onClick={toggleCollapsed}>
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

export default AdminSideMenu;
