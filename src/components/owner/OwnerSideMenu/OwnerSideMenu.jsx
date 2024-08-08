import React, { useState } from 'react';
import { Menu, Layout } from 'antd';
import {
  HomeOutlined,
  UserAddOutlined,
  CarOutlined,
  IdcardOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './OwnerSideMenu.css';

const { Sider } = Layout;

// Define the menu items configuration
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
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
    link: '/owner/settings',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    link: '/logout',
  },
];

const OwnerSideMenu = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const renderMenuItems = items =>
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '16px 0',
            cursor: 'pointer',
            borderBottom: '1px solid #e8e8e8',
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

export default OwnerSideMenu;
