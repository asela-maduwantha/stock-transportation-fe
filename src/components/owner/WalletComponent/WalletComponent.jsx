import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Table, Button, Typography, Spin, Modal, Input, message } from 'antd';
import { WalletOutlined, ArrowUpOutlined, ArrowDownOutlined, NumberOutlined, CalendarOutlined, DollarOutlined, SwapOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const { Title, Text } = Typography;

const PrimaryButton = ({ children, onClick, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Button
      type="primary"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: '#fdb940',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 'normal',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, opacity 0.3s ease',
        opacity: isHovered ? '0.8' : '1',
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

const WalletComponent = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    const ownerId = localStorage.getItem('ownerId');
    if (!ownerId) {
      setError('Owner ID not found in localStorage');
      setLoading(false);
      return;
    }

    try {
      const response = await httpService.get(`/owner/wallet/${ownerId}`);
      setWalletData(response.data);
    } catch (err) {
      setError('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    const ownerId = localStorage.getItem('ownerId');
    
    try {
      // Check bank account availability
      const bankCheckResponse = await httpService.get(`/owner/bankAccAvailability/${ownerId}`);
      if (bankCheckResponse.status !== 200) {
        message.error('Bank account not found. Please add a bank account first.');
        navigate('/owner/create-bank-account');
        return;
      }

      // Proceed with withdrawal
      const walletId = bankCheckResponse.data.id;
      await httpService.post(`/owner/makeWithdrawal/${walletId}`, { amount: parseFloat(withdrawAmount) });
      message.success('Withdrawal successful');
      setIsWithdrawModalVisible(false);
      setWithdrawAmount('');
      fetchWalletData(); // Refresh wallet data
    } catch (error) {
      message.error('Withdrawal failed. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const columns = [
    {
      title: <NumberOutlined />,
      key: 'index',
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: <><CalendarOutlined /> Date</>,
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: <><DollarOutlined /> Amount</>,
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ color: record.type === 'credit' ? 'green' : 'red' }}>
          {record.type === 'credit' ? '+' : '-'}LKR {Math.abs(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: <><SwapOutlined /> Type</>,
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span>
          {type === 'credit' ? <ArrowUpOutlined style={{ color: 'green' }} /> : <ArrowDownOutlined style={{ color: 'red' }} />}
          {' '}
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      ),
    },
  ];

  if (loading) return <Spin size="large" />;
  if (error) return <Text type="danger">{error}</Text>;

  return (
    <Card
      title={<Title level={3}><WalletOutlined /> My Wallet</Title>}
      extra={
        <PrimaryButton 
          onClick={() => setIsWithdrawModalVisible(true)}
          disabled={walletData.earnings <= 0}
        >
          Withdraw Earnings
        </PrimaryButton>
      }
    >
      <div className="wallet-info">
        <Text strong>Balance: LKR {walletData.balance.toFixed(2)}</Text>
        <br />
        <Text>Total Earnings: LKR {walletData.earnings.toFixed(2)}</Text>
        <br />
        <Text>Total Withdrawals: LKR {walletData.withdrawels.toFixed(2)}</Text>
      </div>
      <Title level={4} style={{ marginTop: '20px' }}>Transaction History</Title>
      <Table
        dataSource={walletData.transactions}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
      <Modal
        title="Withdraw Earnings"
        visible={isWithdrawModalVisible}
        onOk={handleWithdraw}
        onCancel={() => setIsWithdrawModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsWithdrawModalVisible(false)}>
            Cancel
          </Button>,
          <PrimaryButton key="submit" loading={withdrawLoading} onClick={handleWithdraw}>
            Withdraw
          </PrimaryButton>,
        ]}
      >
        <Input
          type="number"
          placeholder="Enter amount to withdraw"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          min={0}
          max={walletData.earnings}
        />
      </Modal>
    </Card>
  );
};

export default WalletComponent;