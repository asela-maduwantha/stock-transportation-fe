import React, { useState } from 'react';
import {
  ContainerOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  CarOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { Link, useHistory } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    link: '/driver/dashboard',
  },
  {
    key: 'pickup-stock',
    icon: <ContainerOutlined />,
    label: 'Stock Pending Pickup',
    link: '/driver/pickupstock',
  },
  {
    key: 'assigned-trips',
    icon: <CarOutlined />,
    label: 'Assigned Trips',
    link: '/driver/assigned-trips',
  },
  {
    key: 'vehicles',
    icon: <CarOutlined />,
    label: 'Vehicles',
    link: '/driver/vehicles',
  },
  {
    key: 'profile-settings',
    icon: <UserOutlined />,
    label: 'Profile Settings',
    link: '/driver/profile-settings',
  },
  {
    key: 'help',
    icon: <InfoCircleOutlined />,
    label: 'Help',
    link: '/driver/help',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    link: '/logout',
  },
];

const DriverSideMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const history = useHistory();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
   
    localStorage.clear();
    history.push('/driver/signin'); 
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

export default DriverSideMenu;
