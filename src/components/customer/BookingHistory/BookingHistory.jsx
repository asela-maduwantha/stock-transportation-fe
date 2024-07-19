import React, { useState } from 'react';
import { Table, Button, Modal, Tag, Rate, Space } from 'antd';

const BookingHistory = () => {
  // Sample data for booking history (replace with actual data)
  const [data, setData] = useState([
    {
      key: '1',
      vehicle: 'Toyota Camry',
      bookingDate: '2024-07-07',
      pickupLocation: 'Colombo',
      returnLocation: 'Kandy',
      distance: '120 km',
      status: 'Completed',
      driver: 'John Doe',
    },
    {
      key: '2',
      vehicle: 'Honda Civic',
      bookingDate: '2024-07-06',
      pickupLocation: 'Galle',
      returnLocation: 'Matara',
      distance: '50 km',
      status: 'Canceled',
      driver: 'Jane Smith',
    },
    {
      key: '3',
      vehicle: 'Hyundai Sonata',
      bookingDate: '2024-07-05',
      pickupLocation: 'Jaffna',
      returnLocation: 'Anuradhapura',
      distance: '180 km',
      status: 'Completed',
      driver: 'Michael Brown',
    },
    {
      key: '4',
      vehicle: 'Nissan Altima',
      bookingDate: '2024-07-04',
      pickupLocation: 'Negombo',
      returnLocation: 'Bentota',
      distance: '90 km',
      status: 'Completed',
      driver: 'Emily Johnson',
    },
    {
      key: '5',
      vehicle: 'Mazda CX-5',
      bookingDate: '2024-07-03',
      pickupLocation: 'Ella',
      returnLocation: 'Nuwara Eliya',
      distance: '60 km',
      status: 'Completed',
      driver: 'William Davis',
    },
    {
      key: '6',
      vehicle: 'Ford Escape',
      bookingDate: '2024-07-02',
      pickupLocation: 'Dambulla',
      returnLocation: 'Sigiriya',
      distance: '40 km',
      status: 'Canceled',
      driver: 'Olivia Wilson',
    },
    {
      key: '7',
      vehicle: 'Chevrolet Malibu',
      bookingDate: '2024-07-01',
      pickupLocation: 'Hikkaduwa',
      returnLocation: 'Unawatuna',
      distance: '25 km',
      status: 'Completed',
      driver: 'Daniel Martinez',
    },
    {
      key: '8',
      vehicle: 'Tesla Model S',
      bookingDate: '2024-07-15',
      pickupLocation: 'Colombo',
      returnLocation: 'Negombo',
      distance: '35 km',
      status: 'Upcoming',
      driver: 'Chris Green',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [rating, setRating] = useState(0);
  const [filter, setFilter] = useState('Upcoming'); // Default to upcoming

  const handleViewDetails = (record) => {
    setSelectedTrip(record);
    setRating(record.rating || 0); // Initialize rating from record or default to 0 if not available
    setModalVisible(true);
  };

  const handleRateChange = (value) => {
    setRating(value);
    // Update the rating in your data or backend here (e.g., via API call)
    const updatedData = data.map(item =>
      item.key === selectedTrip.key ? { ...item, rating: value } : item
    );
    setData(updatedData);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleCancelBooking = (key) => {
    // Cancel the booking (update status to 'Canceled')
    const updatedData = data.map(item =>
      item.key === key ? { ...item, status: 'Canceled' } : item
    );
    setData(updatedData);
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicle',
      key: 'vehicle',
    },
    {
      title: 'Booking Date',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
    },
    {
      title: 'Pickup Location',
      dataIndex: 'pickupLocation',
      key: 'pickupLocation',
    },
    {
      title: 'Return Location',
      dataIndex: 'returnLocation',
      key: 'returnLocation',
    },
    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
    },
    {
      title: 'Driver',
      dataIndex: 'driver',
      key: 'driver',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'Completed':
            color = 'green';
            break;
          case 'Canceled':
            color = 'red';
            break;
          case 'Upcoming':
            color = 'blue';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space>
          <Button
            type="primary"
            style={{ backgroundColor: 'rgb(253, 185, 64)', borderColor: 'rgb(253, 185, 64)' }}
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
          {record.status === 'Upcoming' && (
            <Button type="danger" onClick={() => handleCancelBooking(record.key)}>
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item => item.status === filter);

  return (
    <>
      <center>
        <h1>Booking History</h1>
        <br />
        <Space>
          <Button onClick={() => handleFilterChange('Upcoming')}>Upcoming</Button>
          <Button onClick={() => handleFilterChange('Completed')}>Completed</Button>
          <Button onClick={() => handleFilterChange('Canceled')}>Canceled</Button>
        </Space>
      </center>
      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
        style={{ margin: '20px' }}
      />

      <Modal
        title="Trip Details"
        visible={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
      >
        {selectedTrip && (
          <div>
            <p><strong>Vehicle:</strong> {selectedTrip.vehicle}</p>
            <p><strong>Booking Date:</strong> {selectedTrip.bookingDate}</p>
            <p><strong>Pickup Location:</strong> {selectedTrip.pickupLocation}</p>
            <p><strong>Return Location:</strong> {selectedTrip.returnLocation}</p>
            <p><strong>Distance:</strong> {selectedTrip.distance}</p>
            <p><strong>Driver:</strong> {selectedTrip.driver}</p>
            <p><strong>Status:</strong> <Tag color={selectedTrip.status === 'Completed' ? 'green' : 'red'}>{selectedTrip.status}</Tag></p>
            {selectedTrip.status === 'Completed' && (
              <div style={{ marginBottom: '16px' }}>
                <p><strong>Rate this trip:</strong></p>
                <Rate value={rating} onChange={handleRateChange} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default BookingHistory;
