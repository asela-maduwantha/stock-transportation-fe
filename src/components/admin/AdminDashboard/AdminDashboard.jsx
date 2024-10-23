import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tabs } from 'antd';
import { UserOutlined, CarOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined, GiftOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import httpService from '../../../services/httpService';

const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [bookingsCount, setBookingsCount] = useState(null);
  const [serviceCharges, setServiceCharges] = useState([]);
  const [rewards, setRewards] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsResponse, chargesResponse, rewardsResponse] = await Promise.all([
          httpService.get('/admin/bookingsCount'),
          httpService.get('/admin/serviceCharges'),
          httpService.get('/admin/rewards')
        ]);
        setBookingsCount(bookingsResponse.data);
        setServiceCharges(chargesResponse.data);
        setRewards(rewardsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateServiceCharges = () => {
    const totalAmount = serviceCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const completedCharges = serviceCharges.filter(charge => charge.type === 'completed');
    const cancelledCharges = serviceCharges.filter(charge => charge.type === 'cancelled');

    return {
      totalAmount,
      totalCount: serviceCharges.length,
      completedAmount: completedCharges.reduce((sum, charge) => sum + charge.amount, 0).toFixed(2),
      completedCount: completedCharges.length,
      cancelledAmount: cancelledCharges.reduce((sum, charge) => sum + charge.amount, 0).toFixed(2),
      cancelledCount: cancelledCharges.length
    };
  };

  const calculateRewards = () => {
    if (!rewards) return null;

    const totalOwnerRewards = rewards.ownerRewards.reduce((sum, reward) => sum + reward.amount, 0);
    const totalCustomerRewards = rewards.CustomerRewards.reduce((sum, reward) => sum + reward.rewardAmount, 0);

    return {
      ownerRewardsTotal: totalOwnerRewards,
      ownerRewardsCount: rewards.ownerRewards.length,
      customerRewardsTotal: totalCustomerRewards,
      customerRewardsCount: rewards.CustomerRewards.length,
      totalRewards: totalOwnerRewards + totalCustomerRewards
    };
  };

  const charges = calculateServiceCharges();
  const rewardsStats = calculateRewards();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const bookingsPieChartData = bookingsCount ? [
    { name: 'Original Upcoming', value: bookingsCount.originalUpcoming },
    { name: 'Original Completed', value: bookingsCount.originalCompleted },
    { name: 'Original Cancelled', value: bookingsCount.originalCancelled },
    { name: 'Shared Bookings', value: bookingsCount.totalShared }
  ] : [];

  const serviceChargesBarChartData = [
    { name: 'Completed', amount: charges.completedAmount },
    { name: 'Cancelled', amount: charges.cancelledAmount }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Admin Dashboard</h1>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="Bookings" key="1">
          {bookingsCount && (
            <>
              <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Bookings"
                      value={bookingsCount.total}
                      prefix={<CarOutlined style={{ color: '#fdb940' }} />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Original Bookings"
                      value={bookingsCount.totalOriginal}
                      prefix={<UserOutlined style={{ color: '#fdb940' }} />}
                    />
                   
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Shared Bookings"
                      value={bookingsCount.totalShared}
                      prefix={<UserOutlined style={{ color: '#fdb940' }} />}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Bookings Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={bookingsPieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {bookingsPieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Booking Details">
                    <Statistic title="Original Upcoming" value={bookingsCount.originalUpcoming} prefix={<CarOutlined style={{ color: '#fdb940' }} />} />
                    <Statistic title="Original Completed" value={bookingsCount.originalCompleted} prefix={<CheckCircleOutlined style={{ color: '#fdb940' }} />} />
                    <Statistic title="Original Cancelled" value={bookingsCount.originalCancelled} prefix={<CloseCircleOutlined style={{ color: '#fdb940' }} />} />
                    <Statistic title="Shared Upcoming" value={bookingsCount.sharedUpcoming} prefix={<CarOutlined style={{ color: '#fdb940' }} />} />
                    <Statistic title="Shared Completed" value={bookingsCount.sharedCompleted} prefix={<CheckCircleOutlined style={{ color: '#fdb940' }} />} />
                    <Statistic title="Shared Cancelled" value={bookingsCount.sharedCancelled} prefix={<CloseCircleOutlined style={{ color: '#fdb940' }} />} />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>

        <TabPane tab="Service Charges" key="2">
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Service Charges"
                  value={charges.totalAmount.toFixed(2)}
                  prefix={<DollarOutlined style={{ color: '#fdb940' }} />}
                  suffix="LKR"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Completed Service Charges"
                  value={charges.completedAmount}
                  prefix={<DollarOutlined style={{ color: '#fdb940' }} />}
                  suffix="LKR"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Cancelled Service Charges"
                  value={charges.cancelledAmount}
                  prefix={<DollarOutlined style={{ color: '#fdb940' }} />}
                  suffix="LKR"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="Service Charges Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceChargesBarChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="#fdb940" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Service Charge Details">
                <Statistic title="Total Service Charge Count" value={charges.totalCount} prefix={<DollarOutlined style={{ color: '#fdb940' }} />} />
                <Statistic title="Completed Service Charge Count" value={charges.completedCount} prefix={<CheckCircleOutlined style={{ color: '#fdb940' }} />} />
                <Statistic title="Cancelled Service Charge Count" value={charges.cancelledCount} prefix={<CloseCircleOutlined style={{ color: '#fdb940' }} />} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Rewards" key="3">
          {rewardsStats && (
            <>
              <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Rewards"
                      value={rewardsStats.totalRewards}
                      prefix={<GiftOutlined style={{ color: '#fdb940' }} />}
                      suffix="LKR"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Owner Rewards"
                      value={rewardsStats.ownerRewardsTotal}
                      prefix={<GiftOutlined style={{ color: '#fdb940' }} />}
                      suffix="LKR"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Customer Rewards"
                      value={rewardsStats.customerRewardsTotal}
                      prefix={<GiftOutlined style={{ color: '#fdb940' }} />}
                      suffix="LKR"
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Rewards Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Owner Rewards', value: rewardsStats.ownerRewardsTotal },
                            { name: 'Customer Rewards', value: rewardsStats.customerRewardsTotal }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill={COLORS[0]} />
                          <Cell fill={COLORS[1]} />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Rewards Details">
                    <Statistic title="Owner Rewards Count" value={rewardsStats.ownerRewardsCount} prefix={<GiftOutlined style={{ color: '#fdb940' }} />} />
                    <Statistic title="Customer Rewards Count" value={rewardsStats.customerRewardsCount} prefix={<GiftOutlined style={{ color: '#fdb940' }} />} />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;