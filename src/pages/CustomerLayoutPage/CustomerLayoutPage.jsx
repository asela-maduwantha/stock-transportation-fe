import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import AdminHeader from '../../components/admin/AdminHeader/AdminHeader';
import CustomerSidemenu from '../../components/customer/CustomerSidemenu/CustomerSidemenu';

const CustomerLayoutPage = () => {
  const [loading, setLoading] = useState(true);

  // Simulate content loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after content is loaded
    }, 1000); // Adjust the delay as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="admin-Header">
        <AdminHeader />
      </div>
      <div className="customer-body" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <div className="side-menu">
          <CustomerSidemenu />
        </div>
        <div className="body-content" style={{ width: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Outlet />
           
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLayoutPage;
