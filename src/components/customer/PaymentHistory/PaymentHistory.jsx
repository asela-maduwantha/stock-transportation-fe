import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, message } from 'antd';
import { LoadingOutlined, DollarOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';


const { Title } = Typography;

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      message.error('Customer ID not found');
      return;
    }

    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        const response = await httpService.get(`/customer/payment/${customerId}`);
        setPayments(response.data);
      } catch (error) {
        console.error('Error fetching payment history:', error);
        message.error('Failed to fetch payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  const columns = [
    {
      title: 'Payment ID',
      dataIndex: 'advancePaymentId',
      key: 'advancePaymentId',
      render: (text) => <span style={{ wordBreak: 'break-all' }}>{text}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'advancePaymentDate',
      key: 'advancePaymentDate',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Advance Payment',
      dataIndex: 'advancePaymentAmount',
      key: 'advancePaymentAmount',
      render: (amount) => `LKR ${amount.toFixed(2)}`,
    },
    {
      title: 'Balance Payment',
      dataIndex: 'balPaymentAmount',
      key: 'balPaymentAmount',
      render: (amount) => amount ? `LKR ${amount.toFixed(2)}` : '-',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (amount) => `LKR ${amount.toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>
        <DollarOutlined style={{ marginRight: '8px' }} />
        Payment History
      </Title>
      <Table
        dataSource={payments}
        columns={columns}
        rowKey="advancePaymentId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default PaymentHistory;