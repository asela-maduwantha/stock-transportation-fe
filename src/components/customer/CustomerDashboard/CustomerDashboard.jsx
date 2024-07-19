import React from 'react';
import { Row, Col, Card, Statistic, Divider, Button } from 'antd';
import { Bar } from 'react-chartjs-2';
import { CheckCircleOutlined, CloseCircleOutlined, CarOutlined, UserOutlined } from '@ant-design/icons';

const CustomerDashboard = () => {
  const totalTrips = 25;
  const completedTrips = 20;
  const canceledTrips = 5;
  const totalDrivers = 10;

  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Number of Trips',
        backgroundColor: [
          'rgba(75,192,192,0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(75,192,192,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          'rgba(75,192,192,0.4)',
          'rgba(54, 162, 235, 0.4)',
          'rgba(255, 206, 86, 0.4)',
          'rgba(153, 102, 255, 0.4)',
          'rgba(255, 159, 64, 0.4)',
          'rgba(255, 99, 132, 0.4)',
        ],
        hoverBorderColor: [
          'rgba(75,192,192,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        data: [10, 15, 20, 18, 22, 17],
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard" style={{ padding: '25px' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Trips"
              value={totalTrips}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Trips"
              value={completedTrips}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Canceled Trips"
              value={canceledTrips}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Drivers"
              value={totalDrivers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Recent Trips">
            <p>No recent trips.</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Actions">
            <Button type="primary" href='/customer/booking'>Book a Trip</Button>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Monthly Trips Chart">
            <Bar data={chartData} options={chartOptions} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDashboard;
