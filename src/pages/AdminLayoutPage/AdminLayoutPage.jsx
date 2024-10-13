import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import AdminHeader from '../../components/admin/AdminHeader/AdminHeader';

const AdminLayoutPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulating a loading time of 1 second

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="admin-header">
        <AdminHeader />
      </div>
      <div className="admin-body" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <div className="admin-body-content" style={{ width: '100%' }}>
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

export default AdminLayoutPage;
