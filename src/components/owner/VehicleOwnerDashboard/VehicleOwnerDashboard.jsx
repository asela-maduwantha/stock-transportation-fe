import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Pagination } from 'antd';
import { Line, Pie } from 'react-chartjs-2';
import { UserOutlined, CarOutlined, AreaChartOutlined, DollarOutlined } from '@ant-design/icons';
import Slider from 'react-slick';
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

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentGraphPage, setCurrentGraphPage] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const statisticCards = [
    {
      title: "Total Drivers",
      value: driverData.length,
      prefix: <UserOutlined style={{ color: '#3f8600' }} />,
    },
    {
      title: "Total Vehicles",
      value: vehicleData.length,
      prefix: <CarOutlined style={{ color: '#cf1322' }} />,
    },
    {
      title: "Total Trips",
      value: tripData.reduce((acc, curr) => acc + curr.trips, 0),
      prefix: <AreaChartOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: "Total Revenue",
      value: revenueData.reduce((acc, curr) => acc + curr.revenue, 0),
      prefix: <DollarOutlined style={{ color: '#ffa940' }} />,
      formatter: value => `$${value}`,
    },
  ];

  const graphs = [
    {
      title: "Trips Over Time",
      component: <Line data={tripChartData} options={tripChartOptions} />,
    },
    {
      title: "Trips per Driver",
      component: <Pie data={pieChartData} options={pieChartOptions} />,
    },
    {
      title: "Revenue per Driver",
      component: <Pie data={revenueChartData} options={pieChartOptions} />,
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      {isMobile ? (
        <Slider {...carouselSettings}>
          {statisticCards.map((card, index) => (
            <div key={index}>
              <Card>
                <Statistic 
                  title={card.title} 
                  value={card.value} 
                  prefix={card.prefix}
                  formatter={card.formatter}
                />
              </Card>
            </div>
          ))}
        </Slider>
      ) : (
        <Row gutter={[16, 16]}>
          {statisticCards.map((card, index) => (
            <Col span={6} key={index}>
              <Card>
                <Statistic 
                  title={card.title} 
                  value={card.value} 
                  prefix={card.prefix}
                  formatter={card.formatter}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div style={{ marginTop: '20px' }}>
        {isMobile ? (
          <>
            <Card 
              title={graphs[currentGraphPage - 1].title} 
              style={{ height: '300px' }}
            >
              <div style={{ height: '240px' }}>
                {graphs[currentGraphPage - 1].component}
              </div>
            </Card>
            <Pagination 
              current={currentGraphPage} 
              total={graphs.length * 10} 
              onChange={setCurrentGraphPage}
              style={{ marginTop: '10px', textAlign: 'center' }}
            />
          </>
        ) : (
          <Row gutter={[16, 16]}>
            {graphs.map((graph, index) => (
              <Col span={index === 2 ? 12 : 12} offset={index === 2 ? 6 : 0} key={index}>
                <Card title={graph.title} style={{ height: '300px' }}>
                  <div style={{ height: '240px' }}>
                    {graph.component}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default VehicleOwnerDashboard;