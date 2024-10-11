import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Spin, Empty, message } from 'antd';
import { GiftOutlined, CalendarOutlined, PercentageOutlined } from '@ant-design/icons';
import httpService from '../../../services/httpService';

const RewardList = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        const customerId = localStorage.getItem('customerId');
        if (!customerId) {
          throw new Error('Customer ID not found');
        }
        const response = await httpService.get(`/customer/rewards/${customerId}`);
        setRewards(response.data);
      } catch (error) {
        console.error('Error fetching rewards:', error);
        message.error('Failed to fetch rewards');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  if (rewards.length === 0) {
    return <Empty description="No rewards found" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
        My Rewards
      </h1>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={rewards}
        renderItem={(reward) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <Tag color={reward.isClaimed ? 'green' : 'blue'} key="status">
                  {reward.isClaimed ? 'Claimed' : 'Available'}
                </Tag>,
              ]}
            >
              <Card.Meta
                avatar={<GiftOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                title={`Reward ${reward.id}`}
                description={
                  <>
                    <p>
                      <CalendarOutlined style={{ marginRight: '8px' }} />
                      {new Date(reward.date).toLocaleDateString()}
                    </p>
                    <p>
                      <PercentageOutlined style={{ marginRight: '8px' }} />
                      {reward.percentage}% Off
                    </p>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default RewardList;