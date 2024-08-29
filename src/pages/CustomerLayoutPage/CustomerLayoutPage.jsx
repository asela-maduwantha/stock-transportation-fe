import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import CustomerHeader from '../../components/customer/CustomerHeader/CustomerHeader';

const CustomerLayoutPage = () => {
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); 
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="admin-Header">
        <CustomerHeader />
      </div>
      <div className="customer-body" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
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
