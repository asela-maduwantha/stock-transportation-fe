import React, { useState } from 'react';
import {
  ContainerOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
  {
    key: 'pickup-stock',
    icon: <ContainerOutlined />,
    label: 'Stock Pending Pickup',
    link: '/driver/pickupstock',
  },
  {
    key: 'profile-settings',
    icon: <UserOutlined />,
    label: 'Profile Settings',
    link: '/customer/profile-settings',
  },
  {
    key: 'logout',
    icon: <ContainerOutlined />,
    label: 'Logout',
    link: '/logout',
  },
];

const DriverSideMenu = () => {
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
          defaultSelectedKeys={['pickup-stock']}
        >
          {renderMenuItems(menuItems)}
        </Menu>
      </Sider>
    </Layout>
  );
};

export default DriverSideMenu;
