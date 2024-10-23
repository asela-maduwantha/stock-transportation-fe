import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Table, Button, Typography, Spin, Modal, Input, message } from 'antd';
import { WalletOutlined, ArrowUpOutlined, ArrowDownOutlined, NumberOutlined, CalendarOutlined, DollarOutlined, SwapOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import httpService from '../../../services/httpService';

const { Title, Text } = Typography;

const PrimaryButton = ({ children, onClick, disabled, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Button
      type="primary"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: disabled ? '#d9d9d9' : '#fdb940',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 'normal',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s ease, opacity 0.3s ease',
        opacity: isHovered && !disabled ? '0.8' : '1',
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
};

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const WalletComponent = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletData();
    fetchRewards();
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
     
      message.error('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    const ownerId = localStorage.getItem('ownerId');
    try {
      const response = await httpService.get(`/owner/rewards/${ownerId}`);
      setRewards(response.data.filter(reward => !reward.isClaimed));
    
    } catch (err) {
      console.error('Failed to fetch rewards', err);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    // Validate input
    if (isNaN(amount) || (amount <= 0 && !selectedReward)) {
      message.error('Invalid amount. Please enter an amount greater than 0 or claim a reward.');
      return;
    }

    if (amount > walletData.earnings) {
      message.error('Invalid amount. Please enter an amount less than or equal to your total earnings.');
      return;
    }

    setWithdrawLoading(true);
    const ownerId = localStorage.getItem('ownerId');

    try {
      const bankCheckResponse = await httpService.get(`/owner/bankAccAvailability/${ownerId}`);
      console.log(bankCheckResponse)
      if (bankCheckResponse.status !== 200) {
        message.error('Bank account not found. Please add a bank account first.');
        navigate('/owner/create-bank-account');
        return;
      }

      const walletId = bankCheckResponse.data.id;
      await httpService.post(`/owner/makeWithdrawal/${walletId}`, { 
        amount, 
        rewardId: selectedReward ? selectedReward.id : '' 
      });
      message.success('Withdrawal successful');
      setIsWithdrawModalVisible(false);
      setWithdrawAmount('');
      setSelectedReward(null);
      fetchWalletData();
      fetchRewards();
    } catch (error) {
      console.log(error)
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
    {
      title: <><GiftOutlined /> Rewards</>,
      dataIndex: 'rewards',
      key: 'rewards',
      render: (rewards) => (
        rewards ? `Claimed: LKR ${rewards.toFixed(2)}` : 'No reward claimed'
      ),
    },
  ];

  if (loading) return <Spin size="large" />;
  if (error) return <Text type="danger">{error}</Text>;

  const isWithdrawDisabled = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount > walletData.earnings || (amount <= 0 && !selectedReward)) {
      return true;
    }
    return false;
  };

  return (
    <Card
      title={<Title level={3}><WalletOutlined /> My Wallet</Title>}
      extra={
        <PrimaryButton 
          onClick={() => setIsWithdrawModalVisible(true)}
          disabled={walletData.earnings <= 0 && rewards.length === 0}
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
        onCancel={() => {
          setIsWithdrawModalVisible(false);
          setSelectedReward(null);
        }}
        footer={[
          <Button key="back" onClick={() => {
            setIsWithdrawModalVisible(false);
            setSelectedReward(null);
          }}>
            Cancel
          </Button>,
          <PrimaryButton key="submit" loading={withdrawLoading} onClick={handleWithdraw} disabled={isWithdrawDisabled()}>
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
        {rewards.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <Text strong>Available Rewards:</Text>
            {rewards.map(reward => (
              <div key={reward.id} style={{ marginTop: '10px' }}>
                <Text>LKR {reward.rewardAmount.toFixed(2)} - {new Date(reward.date).toLocaleDateString()}</Text>
                <Button 
                  type="link" 
                  onClick={() => setSelectedReward(reward)}
                  style={{ marginLeft: '10px' }}
                >
                  Claim
                </Button>
              </div>
            ))}
          </div>
        )}
        {selectedReward && (
          <div style={{ marginTop: '10px' }}>
            <Text type="success">Selected Reward: LKR {selectedReward.rewardAmount.toFixed(2)}</Text>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default WalletComponent;
