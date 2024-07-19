import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { Line, Pie } from 'react-chartjs-2';
import { UserOutlined, CarOutlined, AreaChartOutlined, DollarOutlined } from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const VehicleOwnerDashboard = () => {
  const driverData = [
    { driver: 'Driver A', trips: 30 },
    { driver: 'Driver B', trips: 20 },
    { driver: 'Driver C', trips: 50 },
  ];

  const vehicleData = [
    { vehicle: 'Vehicle A', trips: 40 },
    { vehicle: 'Vehicle B', trips: 30 },
    { vehicle: 'Vehicle C', trips: 20 },
  ];

  const tripData = [
    { date: '2023-07-01', trips: 5 },
    { date: '2023-07-02', trips: 10 },
    { date: '2023-07-03', trips: 15 },
    { date: '2023-07-04', trips: 8 },
    { date: '2023-07-05', trips: 12 },
  ];

  const revenueData = [
    { driver: 'Driver A', revenue: 500 },
    { driver: 'Driver B', revenue: 300 },
    { driver: 'Driver C', revenue: 700 },
  ];

  const tripChartData = {
    labels: tripData.map(data => data.date),
    datasets: [
      {
        label: 'Number of Trips',
        data: tripData.map(data => data.trips),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  const tripChartOptions = {
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Trips',
        },
      },
    },
    maintainAspectRatio: false,
  };

  const pieChartData = {
    labels: driverData.map(data => data.driver),
    datasets: [
      {
        label: 'Trips per Driver',
        data: driverData.map(data => data.trips),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const revenueChartData = {
    labels: revenueData.map(data => data.driver),
    datasets: [
      {
        label: 'Revenue per Driver',
        data: revenueData.map(data => data.revenue),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    maintainAspectRatio: false,
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Drivers" 
              value={driverData.length} 
              prefix={<UserOutlined style={{ color: '#3f8600' }} />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Vehicles" 
              value={vehicleData.length} 
              prefix={<CarOutlined style={{ color: '#cf1322' }} />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Trips" 
              value={tripData.reduce((acc, curr) => acc + curr.trips, 0)} 
              prefix={<AreaChartOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Revenue" 
              value={`$${revenueData.reduce((acc, curr) => acc + curr.revenue, 0)}`} 
              prefix={<DollarOutlined style={{ color: '#ffa940' }} />} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={12}>
          <Card title="Trips Over Time" style={{ height: '300px' }}>
            <div style={{ height: '240px' }}>
              <Line data={tripChartData} options={tripChartOptions} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Trips per Driver" style={{ height: '300px' }}>
            <div style={{ height: '240px' }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={12} offset={6}>
          <Card title="Revenue per Driver" style={{ height: '300px' }}>
            <div style={{ height: '240px' }}>
              <Pie data={revenueChartData} options={pieChartOptions} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VehicleOwnerDashboard;
