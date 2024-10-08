import React from 'react';
import { Row, Col, Card, Statistic, Divider, Button } from 'antd';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CheckCircleOutlined, CloseCircleOutlined, CarOutlined, UserOutlined } from '@ant-design/icons';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="dashboard" style={{ padding: '25px' }}>
      <Row gutter={[16, 16]}>
        {[
          { title: "Total Trips", value: totalTrips, prefix: <CarOutlined />, color: '#1890ff' },
          { title: "Completed Trips", value: completedTrips, prefix: <CheckCircleOutlined />, color: '#52c41a' },
          { title: "Canceled Trips", value: canceledTrips, prefix: <CloseCircleOutlined />, color: '#f5222d' },
          { title: "Total Drivers", value: totalDrivers, prefix: <UserOutlined />, color: '#fa8c16' },
        ].map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Recent Trips">
            <p>No recent trips.</p>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Actions">
            <Button type="primary" href='/customer/booking'>Book a Trip</Button>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Monthly Trips Chart">
            <div style={{ height: '300px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDashboard;