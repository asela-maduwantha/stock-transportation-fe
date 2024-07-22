import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement
);

const DriverDashboard = () => {
  // Dummy data for the charts
  const bookingData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Bookings',
        data: [10, 20, 15, 25, 30, 20],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const vehicleUsageData = {
    labels: ['Sedan', 'SUV', 'Truck', 'Van'],
    datasets: [
      {
        label: 'Vehicle Usage',
        data: [35, 25, 20, 20],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const stockPickupData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Stock Pickup',
        data: [5, 10, 7, 12],
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.1,
      },
    ],
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Driver Dashboard</h1>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        <div style={{ width: '45%' }}>
          <h3>Bookings per Month</h3>
          <Bar data={bookingData} />
        </div>

        <div style={{ width: '45%' }}>
          <h3>Vehicle Usage</h3>
          <Pie data={vehicleUsageData} />
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <h3>Stock Pickup Over Time</h3>
        <Line data={stockPickupData} />
      </div>
    </div>
  );
};

export default DriverDashboard;
